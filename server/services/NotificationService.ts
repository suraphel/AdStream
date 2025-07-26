import { db } from '../db';
import { 
  favorites, 
  listings, 
  users, 
  notificationPreferences, 
  notificationLogs,
  categories,
  type InsertNotificationLog,
  type NotificationPreference
} from '@shared/schema';
import { eq, and, inArray, desc } from 'drizzle-orm';

export interface NotificationMatch {
  userId: string;
  favoriteListingId: number;
  newListingId: number;
  userPhone?: string;
  favoriteTitle: string;
  newListingTitle: string;
  newListingPrice: string;
  newListingLocation: string;
  categoryName: string;
}

export class NotificationService {
  /**
   * Check for listing matches based on category and send notifications
   */
  async checkAndNotifyForNewListing(newListingId: number): Promise<void> {
    try {
      console.log(`Checking notification matches for listing ${newListingId}`);
      
      // Get the new listing details
      const [newListing] = await db
        .select({
          id: listings.id,
          title: listings.title,
          price: listings.price,
          currency: listings.currency,
          location: listings.location,
          categoryId: listings.categoryId,
          userId: listings.userId,
        })
        .from(listings)
        .leftJoin(categories, eq(listings.categoryId, categories.id))
        .where(eq(listings.id, newListingId));

      if (!newListing) {
        console.log(`New listing ${newListingId} not found`);
        return;
      }

      // Find users who have favorited items in the same category
      const matches = await db
        .select({
          userId: favorites.userId,
          favoriteListingId: favorites.listingId,
          favoriteTitle: listings.title,
          userPhone: users.phone,
          categoryName: categories.name,
          textNotificationsEnabled: users.textNotificationsEnabled,
        })
        .from(favorites)
        .innerJoin(listings, eq(favorites.listingId, listings.id))
        .innerJoin(users, eq(favorites.userId, users.id))
        .innerJoin(categories, eq(listings.categoryId, categories.id))
        .where(
          and(
            eq(listings.categoryId, newListing.categoryId),
            eq(users.textNotificationsEnabled, true)
          )
        );

      console.log(`Found ${matches.length} potential notification matches`);

      // Get notification preferences for matched users
      const userIds = matches.map(match => match.userId);
      if (userIds.length === 0) return;

      const preferences = await db
        .select()
        .from(notificationPreferences)
        .where(
          and(
            inArray(notificationPreferences.userId, userIds),
            eq(notificationPreferences.favoriteMatchNotifications, true)
          )
        );

      const preferencesMap = new Map(
        preferences.map(pref => [pref.userId, pref])
      );

      // Filter matches to only include users with notification preferences enabled
      const eligibleMatches = matches.filter(match => 
        preferencesMap.has(match.userId) && match.userPhone
      );

      console.log(`${eligibleMatches.length} users eligible for notifications`);

      // Send notifications to eligible users
      for (const match of eligibleMatches) {
        await this.sendMatchNotification({
          userId: match.userId,
          favoriteListingId: match.favoriteListingId,
          newListingId: newListing.id,
          userPhone: match.userPhone!,
          favoriteTitle: match.favoriteTitle,
          newListingTitle: newListing.title,
          newListingPrice: `${newListing.price} ${newListing.currency}`,
          newListingLocation: newListing.location,
          categoryName: match.categoryName,
        });
      }
    } catch (error) {
      console.error('Error checking notification matches:', error);
    }
  }

  /**
   * Send notification to a user about a matching listing
   */
  private async sendMatchNotification(match: NotificationMatch): Promise<void> {
    try {
      // Check if we already sent a notification for this combination
      const existingNotification = await db
        .select()
        .from(notificationLogs)
        .where(
          and(
            eq(notificationLogs.userId, match.userId),
            eq(notificationLogs.listingId, match.newListingId),
            eq(notificationLogs.favoriteListingId, match.favoriteListingId)
          )
        )
        .limit(1);

      if (existingNotification.length > 0) {
        console.log(`Notification already sent for user ${match.userId}, listing ${match.newListingId}`);
        return;
      }

      // Create notification message
      const message = this.createNotificationMessage(match);
      
      // For now, we'll log the notification (in production, integrate with SMS service)
      console.log(`NOTIFICATION TO ${match.userPhone}: ${message}`);
      
      // In production, you would integrate with an SMS service like Twilio here:
      // const smsResult = await this.sendSMS(match.userPhone, message);
      
      // Log the notification
      const notificationLog: InsertNotificationLog = {
        userId: match.userId,
        listingId: match.newListingId,
        favoriteListingId: match.favoriteListingId,
        notificationType: 'sms',
        status: 'sent', // In production, this would be based on SMS service response
        message: message,
        sentAt: new Date(),
      };

      await db.insert(notificationLogs).values(notificationLog);
      
      console.log(`Notification logged for user ${match.userId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
      
      // Log failed notification
      const failedLog: InsertNotificationLog = {
        userId: match.userId,
        listingId: match.newListingId,
        favoriteListingId: match.favoriteListingId,
        notificationType: 'sms',
        status: 'failed',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };

      await db.insert(notificationLogs).values(failedLog);
    }
  }

  /**
   * Create notification message text
   */
  private createNotificationMessage(match: NotificationMatch): string {
    const baseUrl = process.env.BASE_URL || 'https://yourapp.replit.app';
    const listingUrl = `${baseUrl}/listing/${match.newListingId}`;
    
    return `🔔 New ${match.categoryName} listing matches your favorite "${match.favoriteTitle}"!\n\n` +
           `📋 ${match.newListingTitle}\n` +
           `💰 ${match.newListingPrice}\n` +
           `📍 ${match.newListingLocation}\n\n` +
           `View listing: ${listingUrl}\n\n` +
           `To stop these notifications, visit your favorites page and disable notifications.`;
  }

  /**
   * Get user's notification preferences
   */
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreference | null> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);
    
    return preferences || null;
  }

  /**
   * Update user's notification preferences
   */
  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    // Check if preferences exist
    const existing = await this.getUserNotificationPreferences(userId);
    
    if (existing) {
      // Update existing preferences
      const [updated] = await db
        .update(notificationPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId))
        .returning();
      
      return updated;
    } else {
      // Create new preferences
      const [created] = await db
        .insert(notificationPreferences)
        .values({
          userId,
          favoriteMatchNotifications: preferences.favoriteMatchNotifications ?? false,
          emailNotifications: preferences.emailNotifications ?? true,
          smsNotifications: preferences.smsNotifications ?? false,
        })
        .returning();
      
      return created;
    }
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(userId: string, limit: number = 20) {
    return await db
      .select({
        id: notificationLogs.id,
        listingTitle: listings.title,
        notificationType: notificationLogs.notificationType,
        status: notificationLogs.status,
        sentAt: notificationLogs.sentAt,
        createdAt: notificationLogs.createdAt,
      })
      .from(notificationLogs)
      .leftJoin(listings, eq(notificationLogs.listingId, listings.id))
      .where(eq(notificationLogs.userId, userId))
      .orderBy(desc(notificationLogs.createdAt))
      .limit(limit);
  }

  /**
   * Enable text notifications for user (updates user profile)
   */
  async enableTextNotifications(userId: string, phone: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        textNotificationsEnabled: true, 
        phone: phone,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }

  /**
   * Disable text notifications for user
   */
  async disableTextNotifications(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        textNotificationsEnabled: false,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
  }
}

export const notificationService = new NotificationService();