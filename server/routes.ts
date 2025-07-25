import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { imageRoutes } from "./routes/imageRoutes";
import path from "path";
import express from "express";
import { insertListingSchema, insertListingImageSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  page: z.string().optional().transform(s => s ? parseInt(s) : 1),
  limit: z.string().optional().transform(s => s ? parseInt(s) : 20),
  featured: z.string().optional().transform(s => s === 'true'),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded images statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Image upload routes
  app.use('/api/images', imageRoutes);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategoriesWithCount();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Listing routes
  app.get('/api/listings', async (req, res) => {
    try {
      const query = searchSchema.parse(req.query);
      const categoryId = query.category ? parseInt(query.category) : undefined;
      
      const listings = await storage.getListings({
        categoryId,
        search: query.search,
        location: query.location,
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
        featured: query.featured,
      });
      
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/listings/:id', async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.claims?.sub;
      
      const listing = await storage.getListingById(id, userId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Increment view count
      await storage.incrementViewCount(id);
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingData = insertListingSchema.parse({ ...req.body, userId });
      
      const listing = await storage.createListing(listingData);
      res.status(201).json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.put('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const updates = insertListingSchema.partial().parse(req.body);
      
      const listing = await storage.updateListing(id, userId, updates);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found or not authorized" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error("Error updating listing:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  app.delete('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const success = await storage.deleteListing(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Listing not found or not authorized" });
      }
      
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // User's listings
  app.get('/api/my-listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listings = await storage.getListings({ userId });
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  // Listing image routes
  app.post('/api/listings/:id/images', isAuthenticated, async (req: any, res) => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify user owns the listing
      const listing = await storage.getListingById(listingId);
      if (!listing || listing.userId !== userId) {
        return res.status(404).json({ message: "Listing not found or not authorized" });
      }
      
      const imageData = insertListingImageSchema.parse({ ...req.body, listingId });
      const image = await storage.addListingImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error adding listing image:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid image data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add listing image" });
    }
  });

  app.delete('/api/listing-images/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const success = await storage.deleteListingImage(id, userId);
      if (!success) {
        return res.status(404).json({ message: "Image not found or not authorized" });
      }
      
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing image:", error);
      res.status(500).json({ message: "Failed to delete listing image" });
    }
  });

  // Favorite routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.body;
      
      if (!listingId || typeof listingId !== 'number') {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const favorite = await storage.addFavorite({ userId, listingId });
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingId = parseInt(req.params.listingId);
      
      const success = await storage.removeFavorite(userId, listingId);
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
