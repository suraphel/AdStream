import {
  users,
  categories,
  listings,
  listingImages,
  favorites,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Listing,
  type InsertListing,
  type ListingImage,
  type InsertListingImage,
  type Favorite,
  type InsertFavorite,
  type ListingWithDetails,
  type CategoryWithCount,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoriesWithCount(): Promise<CategoryWithCount[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Listing operations
  getListings(options?: {
    categoryId?: number;
    userId?: string;
    search?: string;
    location?: string;
    limit?: number;
    offset?: number;
    featured?: boolean;
  }): Promise<ListingWithDetails[]>;
  getListingById(id: number, userId?: string): Promise<ListingWithDetails | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, userId: string, updates: Partial<InsertListing>): Promise<Listing | undefined>;
  deleteListing(id: number, userId: string): Promise<boolean>;
  incrementViewCount(id: number): Promise<void>;

  // Listing image operations
  getListingImages(listingId: number): Promise<ListingImage[]>;
  addListingImage(image: InsertListingImage): Promise<ListingImage>;
  deleteListingImage(id: number, userId: string): Promise<boolean>;

  // Favorite operations
  getFavorites(userId: string): Promise<ListingWithDetails[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, listingId: number): Promise<boolean>;
  isFavorited(userId: string, listingId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
  }

  async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const result = await db
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        nameAm: categories.nameAm,
        icon: categories.icon,
        parentId: categories.parentId,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder,
        createdAt: categories.createdAt,
        listingCount: count(listings.id),
      })
      .from(categories)
      .leftJoin(listings, and(eq(categories.id, listings.categoryId), eq(listings.isActive, true)))
      .where(eq(categories.isActive, true))
      .groupBy(categories.id)
      .orderBy(asc(categories.sortOrder));

    return result.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameAm: row.nameAm,
      icon: row.icon,
      parentId: row.parentId,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      listingCount: Number(row.listingCount),
    }));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Listing operations
  async getListings(options: {
    categoryId?: number;
    userId?: string;
    search?: string;
    location?: string;
    limit?: number;
    offset?: number;
    featured?: boolean;
  } = {}): Promise<ListingWithDetails[]> {
    const {
      categoryId,
      userId,
      search,
      location,
      limit = 20,
      offset = 0,
      featured = false,
    } = options;

    let baseConditions = [eq(listings.isActive, true)];

    if (categoryId) {
      baseConditions.push(eq(listings.categoryId, categoryId));
    }

    if (userId) {
      baseConditions.push(eq(listings.userId, userId));
    }

    if (search) {
      baseConditions.push(
        or(
          ilike(listings.title, `%${search}%`),
          ilike(listings.description, `%${search}%`)
        )
      );
    }

    if (location) {
      baseConditions.push(ilike(listings.location, `%${location}%`));
    }

    if (featured) {
      baseConditions.push(eq(listings.isFeatured, true));
    }

    const query = db
      .select({
        listing: listings,
        user: users,
        category: categories,
      })
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(and(...baseConditions));

    const results = await query
      .orderBy(desc(listings.createdAt))
      .limit(limit)
      .offset(offset);

    // Get images for each listing
    const listingIds = results.map(r => r.listing.id);
    const images = listingIds.length > 0 
      ? await db.select().from(listingImages).where(sql`${listingImages.listingId} = ANY(${listingIds})`)
      : [];

    const imagesByListingId = images.reduce((acc, img) => {
      if (!acc[img.listingId]) acc[img.listingId] = [];
      acc[img.listingId].push(img);
      return acc;
    }, {} as Record<number, ListingImage[]>);

    return results.map(result => ({
      ...result.listing,
      user: result.user,
      category: result.category,
      images: imagesByListingId[result.listing.id] || [],
    }));
  }

  async getListingById(id: number, userId?: string): Promise<ListingWithDetails | undefined> {
    const [result] = await db
      .select({
        listing: listings,
        user: users,
        category: categories,
      })
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(and(eq(listings.id, id), eq(listings.isActive, true)));

    if (!result) return undefined;

    const images = await db
      .select()
      .from(listingImages)
      .where(eq(listingImages.listingId, id))
      .orderBy(asc(listingImages.sortOrder));

    let isFavorited = false;
    if (userId) {
      isFavorited = await this.isFavorited(userId, id);
    }

    return {
      ...result.listing,
      user: result.user,
      category: result.category,
      images,
      isFavorited,
    };
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async updateListing(id: number, userId: string, updates: Partial<InsertListing>): Promise<Listing | undefined> {
    const [updatedListing] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(listings.id, id), eq(listings.userId, userId)))
      .returning();
    return updatedListing;
  }

  async deleteListing(id: number, userId: string): Promise<boolean> {
    const result = await db
      .update(listings)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(listings.id, id), eq(listings.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementViewCount(id: number): Promise<void> {
    await db
      .update(listings)
      .set({ viewCount: sql`${listings.viewCount} + 1` })
      .where(eq(listings.id, id));
  }

  // Listing image operations
  async getListingImages(listingId: number): Promise<ListingImage[]> {
    return db
      .select()
      .from(listingImages)
      .where(eq(listingImages.listingId, listingId))
      .orderBy(asc(listingImages.sortOrder));
  }

  async addListingImage(image: InsertListingImage): Promise<ListingImage> {
    const [newImage] = await db.insert(listingImages).values(image).returning();
    return newImage;
  }

  async deleteListingImage(id: number, userId: string): Promise<boolean> {
    // Check if user owns the listing
    const [image] = await db
      .select({ listingId: listingImages.listingId })
      .from(listingImages)
      .where(eq(listingImages.id, id));

    if (!image) return false;

    const [listing] = await db
      .select({ userId: listings.userId })
      .from(listings)
      .where(eq(listings.id, image.listingId));

    if (!listing || listing.userId !== userId) return false;

    const result = await db.delete(listingImages).where(eq(listingImages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Favorite operations
  async getFavorites(userId: string): Promise<ListingWithDetails[]> {
    const results = await db
      .select({
        listing: listings,
        user: users,
        category: categories,
      })
      .from(favorites)
      .innerJoin(listings, and(eq(favorites.listingId, listings.id), eq(listings.isActive, true)))
      .innerJoin(users, eq(listings.userId, users.id))
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    // Get images for each listing
    const listingIds = results.map(r => r.listing.id);
    const images = listingIds.length > 0 
      ? await db.select().from(listingImages).where(sql`${listingImages.listingId} = ANY(${listingIds})`)
      : [];

    const imagesByListingId = images.reduce((acc, img) => {
      if (!acc[img.listingId]) acc[img.listingId] = [];
      acc[img.listingId].push(img);
      return acc;
    }, {} as Record<number, ListingImage[]>);

    return results.map(result => ({
      ...result.listing,
      user: result.user,
      category: result.category,
      images: imagesByListingId[result.listing.id] || [],
      isFavorited: true,
    }));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite)
      .onConflictDoNothing()
      .returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, listingId: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return (result.rowCount ?? 0) > 0;
  }

  async isFavorited(userId: string, listingId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
    return !!favorite;
  }
}

export const storage = new DatabaseStorage();
