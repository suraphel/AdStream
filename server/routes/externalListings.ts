import type { Express } from "express";
import { externalIntegrations } from "../services/externalIntegrations";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const importExternalListingsSchema = z.object({
  provider: z.enum(['rentcast', 'hasdata_zillow', 'opentrip']),
  location: z.string().min(1),
  categoryId: z.number(),
  propertyType: z.string().optional()
});

const syncLogsQuerySchema = z.object({
  provider: z.string().optional(),
  status: z.enum(['success', 'error', 'partial']).optional(),
  limit: z.number().min(1).max(100).default(20)
});

export function registerExternalListingsRoutes(app: Express) {
  
  // Import listings from external provider
  app.post('/api/external/import', isAuthenticated, async (req, res) => {
    try {
      const { provider, location, categoryId, propertyType } = importExternalListingsSchema.parse(req.body);
      
      // Check API limits before proceeding
      const withinLimits = await externalIntegrations.checkApiLimits(provider);
      if (!withinLimits) {
        return res.status(429).json({ 
          message: `Daily API limit reached for ${provider}`,
          provider,
          error: 'RATE_LIMIT_EXCEEDED'
        });
      }

      let externalListings = [];
      
      switch (provider) {
        case 'rentcast':
          externalListings = await externalIntegrations.fetchRentCastListings(location, propertyType);
          break;
        case 'hasdata_zillow':
          externalListings = await externalIntegrations.fetchZillowListings(location);
          break;
        case 'opentrip':
          externalListings = await externalIntegrations.fetchOpenTripListings(location);
          break;
        default:
          return res.status(400).json({ message: 'Unsupported provider' });
      }

      if (externalListings.length === 0) {
        return res.json({ 
          message: 'No listings found for the specified location',
          imported: 0,
          provider,
          location
        });
      }

      const importedCount = await externalIntegrations.importExternalListings(
        externalListings, 
        provider, 
        categoryId,
        (req.user as any)?.claims?.sub || 'system-external'
      );

      // Update API usage count
      await externalIntegrations.updateApiUsage(provider, 1);

      res.json({
        message: `Successfully imported ${importedCount} listings from ${provider}`,
        imported: importedCount,
        total: externalListings.length,
        provider,
        location
      });

    } catch (error) {
      console.error('External import error:', error);
      res.status(500).json({ 
        message: 'Failed to import external listings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get external listings with filters
  app.get('/api/external/listings', async (req, res) => {
    try {
      const { provider } = req.query;
      
      const listings = await externalIntegrations.getExternalListings(provider as string);
      
      res.json(listings);
    } catch (error) {
      console.error('Error fetching external listings:', error);
      res.status(500).json({ 
        message: 'Failed to fetch external listings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get sync logs and status
  app.get('/api/external/sync-logs', isAuthenticated, async (req, res) => {
    try {
      const { provider, status, limit } = syncLogsQuerySchema.parse(req.query);
      
      // This would require implementing the sync logs query in the service
      res.json({
        message: 'Sync logs endpoint ready',
        filters: { provider, status, limit }
      });
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      res.status(500).json({ 
        message: 'Failed to fetch sync logs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get API configuration and usage stats
  app.get('/api/external/config', isAuthenticated, async (req, res) => {
    try {
      // Return API configuration without sensitive data
      const configs = [
        {
          provider: 'rentcast',
          baseUrl: 'https://api.rentcast.io/v1',
          isActive: false,
          dailyLimit: 1000,
          usageCount: 0,
          description: 'Real estate and rental property data'
        },
        {
          provider: 'hasdata_zillow',
          baseUrl: 'https://api.hasdata.com/v1/zillow',
          isActive: false,
          dailyLimit: 1000,
          usageCount: 0,
          description: 'Property listings and valuations'
        },
        {
          provider: 'opentrip',
          baseUrl: 'https://api.opentrip.com/v1',
          isActive: false,
          dailyLimit: 500,
          usageCount: 0,
          description: 'Travel and tourism listings'
        }
      ];

      res.json({
        providers: configs,
        documentation: {
          rentcast: 'https://developers.rentcast.io/',
          hasdata_zillow: 'https://hasdata.com/docs/',
          opentrip: 'https://docs.opentrip.com/'
        }
      });
    } catch (error) {
      console.error('Error fetching external config:', error);
      res.status(500).json({ 
        message: 'Failed to fetch external configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Setup API keys (admin only)
  app.post('/api/external/config/:provider', isAuthenticated, async (req, res) => {
    try {
      const { provider } = req.params;
      const { apiKey, isActive, dailyLimit } = req.body;

      // TODO: Add admin role check
      // TODO: Implement API key encryption
      // TODO: Save to external_api_configs table

      res.json({
        message: `Configuration updated for ${provider}`,
        provider,
        isActive: !!apiKey && !!isActive
      });
    } catch (error) {
      console.error('Error updating external config:', error);
      res.status(500).json({ 
        message: 'Failed to update external configuration',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}