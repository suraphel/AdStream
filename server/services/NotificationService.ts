import { db } from "../db";
import { 
  notificationPreferences, 
  notificationLogs, 
  listings, 
  categories, 
  users, 
  favorites 
} from "@shared/schema";
import { eq, and, ne, ilike } from "drizzle-orm";
import type { InsertListing, Listing } from "@shared/schema";

export interface NotificationMatch {
  userId: string;
  phoneNumber: string;
  favoriteListingId: number;
  newListingId: number;
  matchReason: string;
}

export class NotificationService {
  // Check for favorite matches when a new listing is created
  static async checkFavoriteMatches(newListing: Listing): Promise<NotificationMatch[]> {
    try {
      // Get all users with notification preferences enabled
      const usersWithNotifications = await db
        .select({
          userId: notificationPreferences.userId,
          phoneNumber: notificationPreferences.phoneNumber,
        })
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.favoriteMatchNotifications, true),
            eq(notificationPreferences.smsNotifications, true)
          )
        );

      if (usersWithNotifications.length === 0) {
        return [];
      }

      const matches: NotificationMatch[] = [];

      // Check each user's favorites for matches
      for (const user of usersWithNotifications) {
        // Skip if it's the user's own listing
        if (user.userId === newListing.userId) {
          continue;
        }

        // Get user's favorites in the same category
        const userFavorites = await db
          .select({
            favorite: favorites,
            listing: listings,
            category: categories,
          })
          .from(favorites)
          .innerJoin(listings, eq(favorites.listingId, listings.id))
          .innerJoin(categories, eq(listings.categoryId, categories.id))
          .where(
            and(
              eq(favorites.userId, user.userId),
              eq(listings.categoryId, newListing.categoryId)
            )
          );

        // Check for matches
        for (const favorite of userFavorites) {
          const matchReasons: string[] = [];

          // 1. Same category (already filtered above)
          matchReasons.push(`Same category: ${favorite.category.name}`);

          // 2. Similar location (case-insensitive partial match)
          if (favorite.listing.location && newListing.location) {
            const favoriteLocation = favorite.listing.location.toLowerCase();
            const newLocation = newListing.location.toLowerCase();
            
            if (favoriteLocation.includes(newLocation) || newLocation.includes(favoriteLocation)) {
              matchReasons.push(`Similar location: ${newListing.location}`);
            }
          }

          // 3. Price range matching (within 20% of favorited item price)
          if (favorite.listing.price && newListing.price) {
            const favoritePrice = parseFloat(favorite.listing.price);
            const newPrice = parseFloat(newListing.price);
            
            if (!isNaN(favoritePrice) && !isNaN(newPrice)) {
              const priceDifference = Math.abs(newPrice - favoritePrice) / favoritePrice;
              if (priceDifference <= 0.2) { // Within 20%
                matchReasons.push(`Similar price: ${newListing.price} ${newListing.currency || 'ETB'}`);
              }
            }
          }

          // 4. Vehicle-specific matching
          if (favorite.listing.modelYear && newListing.modelYear) {
            const yearDiff = Math.abs(newListing.modelYear - favorite.listing.modelYear);
            if (yearDiff <= 2) {
              matchReasons.push(`Similar model year: ${newListing.modelYear}`);
            }
          }

          if (favorite.listing.fuelType && newListing.fuelType === favorite.listing.fuelType) {
            matchReasons.push(`Same fuel type: ${newListing.fuelType}`);
          }

          // 5. Electronics-specific matching
          if (favorite.listing.cpu && newListing.cpu && 
              favorite.listing.cpu.toLowerCase().includes(newListing.cpu.toLowerCase().split(' ')[0])) {
            matchReasons.push(`Similar CPU: ${newListing.cpu}`);
          }

          if (favorite.listing.ram && newListing.ram === favorite.listing.ram) {
            matchReasons.push(`Same RAM: ${newListing.ram}`);
          }

          // If we have at least 2 matching criteria, it's a good match
          if (matchReasons.length >= 2 && user.phoneNumber) {
            matches.push({
              userId: user.userId,
              phoneNumber: user.phoneNumber,
              favoriteListingId: favorite.listing.id,
              newListingId: newListing.id,
              matchReason: matchReasons.join(', ')
            });
          }
        }
      }

      return matches;
    } catch (error) {
      console.error("Error checking favorite matches:", error);
      return [];
    }
  }

  // Send SMS notification (mock implementation for development)
  static async sendSMSNotification(
    phoneNumber: string, 
    message: string, 
    userId: string,
    newListingId: number,
    favoriteListingId?: number
  ): Promise<boolean> {
    try {
      // In development, just log the SMS
      console.log(`SMS to ${phoneNumber}: ${message}`);

      // Log the notification
      await db.insert(notificationLogs).values({
        userId,
        notificationType: 'favorite_match',
        newListingId,
        favoriteListingId: favoriteListingId || null,
        messageContent: message,
        deliveryStatus: 'sent', // In production, this would be determined by the SMS service
        sentAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Error sending SMS notification:", error);
      
      // Log failed notification
      try {
        await db.insert(notificationLogs).values({
          userId,
          notificationType: 'favorite_match',
          newListingId,
          favoriteListingId: favoriteListingId || null,
          messageContent: message,
          deliveryStatus: 'failed',
          sentAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      } catch (logError) {
        console.error("Error logging failed notification:", logError);
      }

      return false;
    }
  }

  // Process favorite matches and send notifications
  static async processFavoriteMatches(newListing: Listing): Promise<void> {
    try {
      const matches = await this.checkFavoriteMatches(newListing);
      
      for (const match of matches) {
        const message = `New ${newListing.title} available in ${newListing.location} - similar to your favorited item. Price: ${newListing.price} ${newListing.currency || 'ETB'}. View: https://ethiomarket.com/listing/${newListing.id}`;
        
        await this.sendSMSNotification(
          match.phoneNumber,
          message,
          match.userId,
          match.newListingId,
          match.favoriteListingId
        );

        // Add small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (matches.length > 0) {
        console.log(`Processed ${matches.length} favorite match notifications for listing ${newListing.id}`);
      }
    } catch (error) {
      console.error("Error processing favorite matches:", error);
    }
  }

  // Get notification statistics for admin dashboard
  static async getNotificationStats(days: number = 30): Promise<{
    totalSent: number;
    successRate: number;
    averagePerDay: number;
    topNotificationTypes: { type: string; count: number }[];
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // This would need proper SQL aggregation - simplified for now
      const logs = await db.select().from(notificationLogs);
      const recentLogs = logs.filter(log => new Date(log.sentAt) >= cutoffDate);

      const totalSent = recentLogs.length;
      const successfulSent = recentLogs.filter(log => log.deliveryStatus === 'sent').length;
      const successRate = totalSent > 0 ? (successfulSent / totalSent) * 100 : 0;
      const averagePerDay = totalSent / days;

      // Count notification types
      const typeCounts = recentLogs.reduce((acc, log) => {
        acc[log.notificationType] = (acc[log.notificationType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topNotificationTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalSent,
        successRate,
        averagePerDay,
        topNotificationTypes,
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      return {
        totalSent: 0,
        successRate: 0,
        averagePerDay: 0,
        topNotificationTypes: [],
      };
    }
  }
}