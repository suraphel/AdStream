import type { Express } from "express";
import { db } from "../db";
import { 
  notificationPreferences, 
  notificationLogs, 
  listings, 
  categories, 
  users, 
  favorites 
} from "@shared/schema";
import { eq, and, inArray, ilike } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";

export function registerNotificationRoutes(app: Express) {
  // Update notification preferences
  app.post('/api/notifications/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { 
        phoneNumber, 
        favoriteMatchNotifications, 
        smsNotifications 
      } = req.body;

      // Validate phone number if SMS notifications are enabled
      if (smsNotifications && (!phoneNumber || !phoneNumber.startsWith('+251'))) {
        return res.status(400).json({ 
          message: "Valid Ethiopian phone number (+251XXXXXXXXX) required for SMS notifications" 
        });
      }

      // Update or create notification preferences
      await db.insert(notificationPreferences)
        .values({
          userId,
          phoneNumber: smsNotifications ? phoneNumber : null,
          smsNotifications,
          favoriteMatchNotifications,
        })
        .onConflictDoUpdate({
          target: notificationPreferences.userId,
          set: {
            phoneNumber: smsNotifications ? phoneNumber : null,
            smsNotifications,
            favoriteMatchNotifications,
            updatedAt: new Date(),
          },
        });

      res.json({ message: "Notification preferences updated successfully" });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Get notification preferences
  app.get('/api/notifications/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const [preferences] = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));

      res.json(preferences || {
        smsNotifications: false,
        favoriteMatchNotifications: false,
        phoneNumber: null,
      });
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  // Get notification history
  app.get('/api/notifications/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const logs = await db
        .select({
          log: notificationLogs,
          listing: listings,
          category: categories,
        })
        .from(notificationLogs)
        .innerJoin(listings, eq(notificationLogs.newListingId, listings.id))
        .innerJoin(categories, eq(listings.categoryId, categories.id))
        .where(eq(notificationLogs.userId, userId))
        .orderBy(notificationLogs.sentAt)
        .limit(limit)
        .offset(offset);

      res.json(logs);
    } catch (error) {
      console.error("Error fetching notification history:", error);
      res.status(500).json({ message: "Failed to fetch notification history" });
    }
  });

  // Test SMS notification (for development)
  app.post('/api/notifications/test-sms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { phoneNumber } = req.body;

      if (!phoneNumber || !phoneNumber.startsWith('+251')) {
        return res.status(400).json({ 
          message: "Valid Ethiopian phone number required" 
        });
      }

      // In development, just log the SMS
      console.log(`Test SMS would be sent to ${phoneNumber}: "EthioMarket test notification - Your notifications are working!"`);

      // Log the test notification
      await db.insert(notificationLogs).values({
        userId,
        notificationType: 'test',
        newListingId: null,
        favoriteListingId: null,
        messageContent: 'Test SMS notification',
        deliveryStatus: 'sent',
        sentAt: new Date(),
      });

      res.json({ 
        message: "Test SMS logged (check console for message content)", 
        phoneNumber 
      });
    } catch (error) {
      console.error("Error sending test SMS:", error);
      res.status(500).json({ message: "Failed to send test SMS" });
    }
  });

  // Mark notifications as read
  app.post('/api/notifications/mark-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { notificationIds } = req.body;

      if (!Array.isArray(notificationIds)) {
        return res.status(400).json({ message: "notificationIds must be an array" });
      }

      await db.update(notificationLogs)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notificationLogs.userId, userId),
            inArray(notificationLogs.id, notificationIds)
          )
        );

      res.json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  // Get notification statistics
  app.get('/api/notifications/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Get total notifications sent in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [preferences] = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));

      // This would need proper SQL aggregation - simplified for now
      const allLogs = await db
        .select()
        .from(notificationLogs)
        .where(eq(notificationLogs.userId, userId));

      const recentLogs = allLogs.filter(log => new Date(log.sentAt) >= thirtyDaysAgo);

      const stats = {
        totalNotifications: allLogs.length,
        last30Days: recentLogs.length,
        notificationsEnabled: preferences?.favoriteMatchNotifications || false,
        smsEnabled: preferences?.smsNotifications || false,
        deliverySuccess: recentLogs.filter(log => log.deliveryStatus === 'sent').length,
        deliveryFailed: recentLogs.filter(log => log.deliveryStatus === 'failed').length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      res.status(500).json({ message: "Failed to fetch notification stats" });
    }
  });
}