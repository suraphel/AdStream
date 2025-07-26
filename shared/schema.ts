import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  phoneNumber: varchar("phone_number"), // Normalized phone for OTP
  password: varchar("password"), // Hashed password for local auth
  region: varchar("region"),
  city: varchar("city"),
  isVerified: boolean("is_verified").default(false),
  phoneVerified: boolean("phone_verified").default(false),
  textNotificationsEnabled: boolean("text_notifications_enabled").default(false),
  preferences: text("preferences"), // JSON string for user preferences
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAm: varchar("name_am", { length: 100 }), // Amharic name
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }), // Font Awesome icon class
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Listings table
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("ETB"),
  categoryId: integer("category_id").notNull(),
  userId: varchar("user_id").notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  condition: varchar("condition", { length: 20 }), // new, used, refurbished
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  // External listing integration fields
  externalSource: varchar("external_source", { length: 50 }), // 'airbnb', 'booking', 'expedia', 'rentcast', etc.
  externalId: varchar("external_id", { length: 100 }), // External platform's listing ID
  externalUrl: varchar("external_url", { length: 500 }), // Direct link to original listing
  externalData: jsonb("external_data"), // Store additional platform-specific data
  
  // Airline ticket specific fields
  departureCity: varchar("departure_city", { length: 100 }),
  arrivalCity: varchar("arrival_city", { length: 100 }),
  departureDate: timestamp("departure_date"),
  returnDate: timestamp("return_date"), // For round trip tickets
  airline: varchar("airline", { length: 50 }),
  flightClass: varchar("flight_class", { length: 20 }), // economy, business, first
  tripType: varchar("trip_type", { length: 20 }), // oneway, roundtrip, multicity
  passengerCount: integer("passenger_count").default(1),
  lastSyncedAt: timestamp("last_synced_at"), // When data was last updated from external source
  syncStatus: varchar("sync_status", { length: 20 }).default("active"), // active, error, disabled
});

// Listing images table
export const listingImages = pgTable("listing_images", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  isPrimary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
  moderationStatus: varchar("moderation_status", { length: 20 }).default("pending"), // pending, approved, rejected, flagged
  moderationScore: decimal("moderation_score", { precision: 5, scale: 4 }), // confidence score 0-1
  moderationReason: text("moderation_reason"), // reason for rejection/flagging
  moderatedAt: timestamp("moderated_at"),
  moderatedBy: varchar("moderated_by"), // admin user ID who reviewed
  originalFilename: varchar("original_filename", { length: 255 }),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_listing_images_listing_id").on(table.listingId),
  index("idx_listing_images_moderation_status").on(table.moderationStatus),
]);

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations table - for message threads between users
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id"), // Optional: link conversation to a specific listing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversation participants - tracks who is in each conversation
export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at"),
}, (table) => [
  index("idx_conversation_participants_conversation").on(table.conversationId),
  index("idx_conversation_participants_user").on(table.userId),
]);

// Notification preferences table - tracks user preferences for different types of notifications
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  favoriteMatchNotifications: boolean("favorite_match_notifications").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_notification_preferences_user").on(table.userId),
]);

// Notification logs table - tracks sent notifications to prevent duplicates
export const notificationLogs = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  favoriteListingId: integer("favorite_listing_id").notNull(), // The favorited listing that triggered this notification
  notificationType: varchar("notification_type", { length: 20 }).notNull(), // 'sms', 'email', 'push'
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'sent', 'failed'
  message: text("message"),
  externalMessageId: varchar("external_message_id", { length: 100 }), // SMS service message ID
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notification_logs_user").on(table.userId),
  index("idx_notification_logs_listing").on(table.listingId),
  index("idx_notification_logs_status").on(table.status),
]);

// Messages table - individual messages within conversations
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"), // text, image, file
  attachmentUrl: varchar("attachment_url", { length: 500 }),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_messages_conversation").on(table.conversationId),
  index("idx_messages_sender").on(table.senderId),
  index("idx_messages_created_at").on(table.createdAt),
]);

// OTP verification table
export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  otpCode: varchar("otp_code", { length: 6 }).notNull(), // 4-6 digit OTP
  hashedOtp: varchar("hashed_otp", { length: 255 }).notNull(), // Hashed OTP for security
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  verificationType: varchar("verification_type", { length: 20 }).notNull(), // 'registration', 'password_reset', 'phone_verification'
  userId: varchar("user_id"), // Optional: link to user for tracking
  metadata: jsonb("metadata"), // Additional data like registration details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_otp_phone_number").on(table.phoneNumber),
  index("idx_otp_expires_at").on(table.expiresAt),
  index("idx_otp_verification_type").on(table.verificationType),
]);

// OTP rate limiting table
export const otpRateLimits = pgTable("otp_rate_limits", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  requestCount: integer("request_count").default(1),
  firstRequestAt: timestamp("first_request_at").defaultNow(),
  lastRequestAt: timestamp("last_request_at").defaultNow(),
  blockedUntil: timestamp("blocked_until"), // Temporary block for excessive requests
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_otp_rate_limit_phone").on(table.phoneNumber),
  index("idx_otp_rate_limit_blocked").on(table.blockedUntil),
]);

// External API configurations table
export const externalApiConfigs = pgTable("external_api_configs", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull().unique(), // 'rentcast', 'hasdata_zillow', 'opentrip'
  apiKey: varchar("api_key", { length: 200 }), // Encrypted API key
  baseUrl: varchar("base_url", { length: 200 }).notNull(),
  isActive: boolean("is_active").default(true),
  dailyLimit: integer("daily_limit").default(1000),
  usageCount: integer("usage_count").default(0),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  configuration: jsonb("configuration"), // Provider-specific config
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sync logs table to track external data imports
export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(),
  operation: varchar("operation", { length: 50 }).notNull(), // 'import', 'update', 'delete'
  status: varchar("status", { length: 20 }).notNull(), // 'success', 'error', 'partial'
  recordsProcessed: integer("records_processed").default(0),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Additional sync details
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  favorites: many(favorites),
  conversationParticipants: many(conversationParticipants),
  sentMessages: many(messages),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [listings.categoryId],
    references: [categories.id],
  }),
  images: many(listingImages),
  favorites: many(favorites),
  conversations: many(conversations),
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [favorites.listingId],
    references: [listings.id],
  }),
}));

// Messaging relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  listing: one(listings, {
    fields: [conversations.listingId],
    references: [listings.id],
  }),
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Notification relations
export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const notificationLogsRelations = relations(notificationLogs, ({ one }) => ({
  user: one(users, {
    fields: [notificationLogs.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [notificationLogs.listingId],
    references: [listings.id],
  }),
  favoriteListing: one(listings, {
    fields: [notificationLogs.favoriteListingId],
    references: [listings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  viewCount: true 
}).extend({
  price: z.union([z.string(), z.number()]).transform((val) => String(val)),
  categoryId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
});
export const insertListingImageSchema = createInsertSchema(listingImages).omit({ 
  id: true, 
  createdAt: true 
});
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ 
  id: true, 
  createdAt: true 
});

// Messaging insert schemas
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notification insert schemas
export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationLogSchema = createInsertSchema(notificationLogs).omit({
  id: true,
  createdAt: true,
});

// OTP insert schemas
export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOtpRateLimitSchema = createInsertSchema(otpRateLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type ListingImage = typeof listingImages.$inferSelect;
export type InsertListingImage = z.infer<typeof insertListingImageSchema>;
export type Favorite = typeof favorites.$inferSelect;

// OTP types
export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;
export type OtpRateLimit = typeof otpRateLimits.$inferSelect;
export type InsertOtpRateLimit = z.infer<typeof insertOtpRateLimitSchema>;

// Messaging types
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Notification types
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type InsertNotificationLog = z.infer<typeof insertNotificationLogSchema>;

// Extended types with relations
export type ListingWithDetails = Listing & {
  user: User;
  category: Category;
  images: ListingImage[];
  isFavorited?: boolean;
};

export type CategoryWithCount = Category & {
  listingCount: number;
};

// Import tender schema for complete system
export * from './tender-schema';

// Export shop-related types and schemas
export * from './shop-schema';
