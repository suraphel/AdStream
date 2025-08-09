import React, { useState } from 'react';
import { useParams } from 'wouter';
import { Layout } from '@/components/Layout';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { CategoryFilters } from '@/components/shared/CategoryFilters';
import { ListingGrid } from '@/components/shared/ListingGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Package, Heart, Star, Clock, Eye } from 'lucide-react';

interface FilterState {
  priceRange: [number, number];
  condition: string[];
  location: string;
  brands: string[];
  transmission: string;
  mileage: [number, number];
  searchTerm: string;
}

export default function MarketplaceSubSubcategory() {
  const params = useParams();
  const categorySlug = params.category;
  const subcategorySlug = params.subcategory;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    condition: [],
    location: 'all',
    brands: [],
    transmission: 'any',
    mileage: [0, 200000],
    searchTerm: ''
  });

  // Convert slug to display name
  const getDisplayName = (slug: string | undefined) => {
    if (!slug) return '';
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const categoryName = getDisplayName(categorySlug);
  const subcategoryName = getDisplayName(subcategorySlug);

  // Generate sub-subcategory specific listings
  const getSubcategoryListings = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: `mp-${categorySlug}-${subcategorySlug}-${i}`,
      title: `${subcategoryName} Item ${i + 1}`,
      price: `${Math.floor(Math.random() * 25000 + 3000).toLocaleString()} ETB`,
      location: ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa', 'Mekelle'][Math.floor(Math.random() * 5)],
      image: '/api/placeholder/300/200',
      category: subcategoryName,
      views: Math.floor(Math.random() * 300 + 25),
      timeLeft: ['3 hours', '1 day', '2 days', '5 days', '1 week'][Math.floor(Math.random() * 5)],
      isFinished: i < 4 && Math.random() > 0.6,
      isUseful: i < 8 && Math.random() > 0.4
    }));
  };

  const subcategoryListings = getSubcategoryListings();
  
  const clearFilters = () => {
    setFilters({
      priceRange: [0, 100000],
      condition: [],
      location: 'all',
      brands: [],
      transmission: 'any',
      mileage: [0, 200000],
      searchTerm: ''
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{subcategoryName}</h1>
            <p className="text-lg mb-6">
              Find the best {subcategoryName.toLowerCase()} in Ethiopia
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Input
                type="text"
                placeholder={`Search for ${subcategoryName.toLowerCase()}...`}
                className="w-full h-12 pl-4 pr-12 text-black"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
              <Button
                size="sm"
                className="absolute right-2 top-2 bg-cyan-600 hover:bg-cyan-700"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation 
          categorySlug="marketplace"
          categoryName="Marketplace"
          subcategorySlug={categorySlug}
          subcategoryName={categoryName}
        />

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-cyan-600" />
                <span className="text-sm text-gray-600">
                  {subcategoryListings.length.toLocaleString()} total listings
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">All locations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-600">Verified sellers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="lg:hidden mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
            
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <CategoryFilters
                filters={filters}
                onFiltersChange={setFilters}
                categorySlug={categorySlug}
                className="w-full"
                isOpen={true}
                onToggle={() => setShowFilters(!showFilters)}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Featured {subcategoryName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subcategoryListings.slice(0, 3).map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative bg-gray-200 h-40 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                      
                      <div className="absolute top-2 left-2 flex gap-1">
                        {listing.isFinished && (
                          <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                            Featured
                          </Badge>
                        )}
                        {listing.isUseful && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                            Useful
                          </Badge>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>

                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {listing.views}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 group-hover:text-cyan-600 transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-cyan-600 font-bold text-lg mb-2">{listing.price}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {listing.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {listing.timeLeft}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Listings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All {subcategoryName}</h2>
              <ListingGrid
                listings={subcategoryListings.slice(3)}
                isLoading={false}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onClearFilters={clearFilters}
              />
            </div>
          </div>
        </div>

        {/* Selling CTA */}
        <div className="mt-12 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Selling {subcategoryName}?
            </h2>
            <p className="text-gray-600 mb-6">
              Join The Square marketplace and reach thousands of buyers
            </p>
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
              <Package className="w-5 h-5 mr-2" />
              Post Your {subcategoryName} Ad
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}