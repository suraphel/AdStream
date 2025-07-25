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
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  viewCount: true 
});
export const insertListingImageSchema = createInsertSchema(listingImages).omit({ 
  id: true, 
  createdAt: true 
});
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type ListingImage = typeof listingImages.$inferSelect;
export type InsertListingImage = z.infer<typeof insertListingImageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

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
