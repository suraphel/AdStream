import { db } from '../db';
import { listings, listingImages, externalApiConfigs, syncLogs } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Types for external listing data
export interface ExternalListing {
  externalId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  images: string[];
  url: string;
  additionalData?: Record<string, any>;
}

export class ExternalIntegrationsService {
  
  // RentCast API Integration - For Real Estate/Rental data
  async fetchRentCastListings(location: string, propertyType?: string): Promise<ExternalListing[]> {
    const config = await this.getApiConfig('rentcast');
    if (!config?.apiKey) {
      throw new Error('RentCast API key not configured');
    }

    try {
      const params = new URLSearchParams({
        address: location,
        propertyType: propertyType || 'All',
        limit: '50'
      });

      const response = await fetch(`${config.baseUrl}/rentals?${params}`, {
        headers: {
          'X-Api-Key': config.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`RentCast API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.listings?.map((item: any) => ({
        externalId: item.id.toString(),
        title: `${item.propertyType} - ${item.bedrooms} bed, ${item.bathrooms} bath`,
        description: item.description || `Beautiful ${item.propertyType.toLowerCase()} in ${item.city}`,
        price: item.rent || item.price || 0,
        currency: 'USD',
        location: `${item.city}, ${item.state}`,
        images: item.photos || [],
        url: item.url || `https://rentcast.io/property/${item.id}`,
        additionalData: {
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          squareFeet: item.squareFeet,
          propertyType: item.propertyType
        }
      })) || [];
    } catch (error) {
      await this.logSyncError('rentcast', 'import', error);
      throw error;
    }
  }

  // HasData Zillow API Integration - For Property data
  async fetchZillowListings(location: string): Promise<ExternalListing[]> {
    const config = await this.getApiConfig('hasdata_zillow');
    if (!config?.apiKey) {
      throw new Error('HasData Zillow API key not configured');
    }

    try {
      const response = await fetch(`${config.baseUrl}/properties/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location,
          limit: 50,
          status: 'for_sale'
        })
      });

      if (!response.ok) {
        throw new Error(`Zillow API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.properties?.map((property: any) => ({
        externalId: property.zpid,
        title: property.address,
        description: property.description || `${property.bedrooms} bed, ${property.bathrooms} bath home`,
        price: property.price || property.zestimate || 0,
        currency: 'USD',
        location: `${property.city}, ${property.state}`,
        images: property.photos || [],
        url: property.url || `https://zillow.com/homedetails/${property.zpid}`,
        additionalData: {
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          livingArea: property.livingArea,
          lotSize: property.lotSize,
          zestimate: property.zestimate
        }
      })) || [];
    } catch (error) {
      await this.logSyncError('hasdata_zillow', 'import', error);
      throw error;
    }
  }

  // OpenTrip API Integration - For Travel/Tourism listings
  async fetchOpenTripListings(location: string): Promise<ExternalListing[]> {
    const config = await this.getApiConfig('opentrip');
    if (!config?.apiKey) {
      throw new Error('OpenTrip API key not configured');
    }

    try {
      const response = await fetch(`${config.baseUrl}/places/search`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`OpenTrip API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.places?.map((place: any) => ({
        externalId: place.id,
        title: place.name,
        description: place.description,
        price: place.price || 0,
        currency: place.currency || 'USD',
        location: place.location,
        images: place.images || [],
        url: place.booking_url || place.website,
        additionalData: {
          category: place.category,
          rating: place.rating,
          amenities: place.amenities
        }
      })) || [];
    } catch (error) {
      await this.logSyncError('opentrip', 'import', error);
      throw error;
    }
  }

  // Import external listings into our database
  async importExternalListings(
    externalListings: ExternalListing[], 
    provider: string, 
    categoryId: number,
    systemUserId: string = 'system-external'
  ): Promise<number> {
    let importedCount = 0;
    const startTime = new Date();

    try {
      for (const externalListing of externalListings) {
        // Check if listing already exists
        const existingListing = await db.select()
          .from(listings)
          .where(and(
            eq(listings.externalSource, provider),
            eq(listings.externalId, externalListing.externalId)
          ))
          .limit(1);

        if (existingListing.length > 0) {
          // Update existing listing
          await db.update(listings)
            .set({
              title: externalListing.title,
              description: externalListing.description,
              price: externalListing.price.toString(),
              currency: externalListing.currency,
              location: externalListing.location,
              externalUrl: externalListing.url,
              externalData: externalListing.additionalData,
              lastSyncedAt: new Date(),
              syncStatus: 'active',
              updatedAt: new Date()
            })
            .where(eq(listings.id, existingListing[0].id));
        } else {
          // Create new listing
          const [newListing] = await db.insert(listings)
            .values({
              title: externalListing.title,
              description: externalListing.description,
              price: externalListing.price.toString(),
              currency: externalListing.currency,
              categoryId,
              userId: systemUserId,
              location: externalListing.location,
              externalSource: provider,
              externalId: externalListing.externalId,
              externalUrl: externalListing.url,
              externalData: externalListing.additionalData,
              lastSyncedAt: new Date(),
              syncStatus: 'active',
              isActive: true,
              isFeatured: false,
              viewCount: 0
            })
            .returning();

          // Add images
          if (externalListing.images.length > 0) {
            const imagePromises = externalListing.images.slice(0, 5).map((imageUrl, index) => 
              db.insert(listingImages).values({
                listingId: newListing.id,
                imageUrl,
                isPrimary: index === 0,
                sortOrder: index
              })
            );
            await Promise.all(imagePromises);
          }

          importedCount++;
        }
      }

      // Log successful sync
      await db.insert(syncLogs).values({
        provider,
        operation: 'import',
        status: 'success',
        recordsProcessed: importedCount,
        startedAt: startTime,
        completedAt: new Date(),
        metadata: { total: externalListings.length, imported: importedCount }
      });

      return importedCount;
    } catch (error) {
      await this.logSyncError(provider, 'import', error, importedCount);
      throw error;
    }
  }

  // Get API configuration for a provider
  private async getApiConfig(provider: string) {
    const [config] = await db.select()
      .from(externalApiConfigs)
      .where(and(
        eq(externalApiConfigs.provider, provider),
        eq(externalApiConfigs.isActive, true)
      ))
      .limit(1);

    return config;
  }

  // Update API usage count
  async updateApiUsage(provider: string, count: number = 1): Promise<void> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const config = await this.getApiConfig(provider);
    if (!config) return;

    // Reset daily count if it's a new day
    const lastReset = config.lastResetAt ? new Date(config.lastResetAt) : new Date(0);
    const lastResetDate = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());

    if (today > lastResetDate) {
      await db.update(externalApiConfigs)
        .set({
          usageCount: count,
          lastResetAt: now,
          updatedAt: now
        })
        .where(eq(externalApiConfigs.provider, provider));
    } else {
      await db.update(externalApiConfigs)
        .set({
          usageCount: (config.usageCount || 0) + count,
          updatedAt: now
        })
        .where(eq(externalApiConfigs.provider, provider));
    }
  }

  // Check if API usage is within limits
  async checkApiLimits(provider: string): Promise<boolean> {
    const config = await this.getApiConfig(provider);
    if (!config) return false;

    const today = new Date();
    const lastReset = config.lastResetAt ? new Date(config.lastResetAt) : new Date(0);
    const isNewDay = today.toDateString() !== lastReset.toDateString();

    if (isNewDay) {
      return true; // New day, reset usage
    }

    return (config.usageCount || 0) < (config.dailyLimit || 1000);
  }

  // Log sync errors
  private async logSyncError(provider: string, operation: string, error: any, recordsProcessed: number = 0): Promise<void> {
    await db.insert(syncLogs).values({
      provider,
      operation,
      status: 'error',
      recordsProcessed,
      errorMessage: error.message || String(error),
      startedAt: new Date(),
      completedAt: new Date(),
      metadata: { error: error.stack }
    });
  }

  // Get external listings by provider
  async getExternalListings(provider?: string) {
    if (provider) {
      return await db.select().from(listings).where(eq(listings.externalSource, provider));
    } else {
      // Get all listings (both external and local)
      return await db.select().from(listings);
    }
  }

  // Cleanup old external listings
  async cleanupOldExternalListings(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db.delete(listings)
      .where(and(
        eq(listings.externalSource, null),
        eq(listings.lastSyncedAt, cutoffDate)
      ));

    return (result as any).rowCount || 0;
  }
}

export const externalIntegrations = new ExternalIntegrationsService();