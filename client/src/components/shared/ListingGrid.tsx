import React from 'react';
import { ListingCard } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Grid, List, Search } from 'lucide-react';

interface ListingGridProps {
  listings: any[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onClearFilters?: () => void;
}

export function ListingGrid({ 
  listings, 
  isLoading, 
  viewMode, 
  onViewModeChange,
  onClearFilters 
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(listings) || listings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
        <p className="text-gray-500 mb-6">
          No listings match your current filters in this category.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* View Mode Controls */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {listings.length} listings found
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
      }>
        {listings.map((listing: any) => (
          <ListingCard 
            key={listing.id} 
            listing={listing} 
          />
        ))}
      </div>
    </>
  );
}