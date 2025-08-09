import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  nameAm: z.string().optional(),
  slug: z.string(),
  parentId: z.number().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Listing schema
export const listingSchema = z.object({
  id: z.number(),
  title: z.string(),
  titleAm: z.string().optional(),
  description: z.string(),
  descriptionAm: z.string().optional(),
  price: z.number(),
  categoryId: z.number(),
  userId: z.number(),
  location: z.string(),
  locationAm: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPremium: z.boolean().default(false),
  views: z.number().default(0),
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    whatsapp: z.string().optional(),
  }).optional(),
  // Vehicle specific fields
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  mileage: z.number().optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']).optional(),
  transmission: z.enum(['manual', 'automatic']).optional(),
  // Electronics specific fields
  warranty: z.string().optional(),
  specifications: z.record(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Listing image schema
export const listingImageSchema = z.object({
  id: z.number(),
  listingId: z.number(),
  imageUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  altText: z.string().optional(),
  sortOrder: z.number().default(0),
  createdAt: z.string().optional(),
});

// Favorite schema
export const favoriteSchema = z.object({
  id: z.number(),
  userId: z.number(),
  listingId: z.number(),
  createdAt: z.string().optional(),
});

// Message schema
export const messageSchema = z.object({
  id: z.number(),
  senderId: z.number(),
  receiverId: z.number(),
  listingId: z.number().optional(),
  subject: z.string(),
  content: z.string(),
  isRead: z.boolean().default(false),
  createdAt: z.string().optional(),
});

// Insert schemas (for form validation)
export const insertUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertCategorySchema = categorySchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertListingSchema = listingSchema.omit({ 
  id: true, 
  views: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  // Make some fields optional for forms
  userId: z.number().optional(), // Will be set by backend
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPremium: z.boolean().optional(),
});

export const insertListingImageSchema = listingImageSchema.omit({ 
  id: true, 
  createdAt: true 
});

export const insertFavoriteSchema = favoriteSchema.omit({ 
  id: true, 
  createdAt: true 
});

export const insertMessageSchema = messageSchema.omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type User = z.infer<typeof userSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Listing = z.infer<typeof listingSchema>;
export type ListingImage = z.infer<typeof listingImageSchema>;
export type Favorite = z.infer<typeof favoriteSchema>;
export type Message = z.infer<typeof messageSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type InsertListingImage = z.infer<typeof insertListingImageSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;