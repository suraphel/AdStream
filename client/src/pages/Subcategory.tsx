import React, { useState } from 'react';
import { useParams } from 'wouter';
import { Layout } from '@/components/Layout';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { CategoryFilters } from '@/components/shared/CategoryFilters';
import { ListingGrid } from '@/components/shared/ListingGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Package, Heart, Star } from 'lucide-react';
import { getStaticCategoryData } from '@/lib/staticCategoryData';

interface FilterState {
  priceRange: [number, number];
  condition: string[];
  location: string;
  brands: string[];
  transmission: string;
  mileage: [number, number];
  searchTerm: string;
}

export default function Subcategory() {
  const params = useParams();
  const categorySlug = params.category;
  const subcategorySlug = params.subcategory;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    condition: [],
    location: 'all',
    brands: [],
    transmission: 'any',
    mileage: [0, 200000],
    searchTerm: ''
  });

  // Get static data for the main category
  const categoryData = categorySlug ? getStaticCategoryData(categorySlug) : null;
  
  // Find the subcategory
  const subcategory = categoryData?.subcategories.find(sub => 
    sub.name.toLowerCase().replace(/\s+/g, '-') === subcategorySlug ||
    sub.name.toLowerCase() === subcategorySlug?.replace('-', ' ')
  );

  // Generate subcategory-specific listings
  const getSubcategoryListings = () => {
    if (!categoryData || !subcategory) return [];
    
    // Filter main category listings to show only relevant ones
    return categoryData.featuredListings
      .filter(listing => 
        listing.category.toLowerCase().includes(subcategory.name.toLowerCase()) ||
        listing.title.toLowerCase().includes(subcategory.name.toLowerCase())
      )
      .concat([
        // Add more specific listings for this subcategory
        ...Array.from({ length: 12 }, (_, i) => ({
          id: `sub-${i}`,
          title: `${subcategory.name} Item ${i + 1}`,
          price: `${Math.floor(Math.random() * 50000 + 10000).toLocaleString()} ETB`,
          location: ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa'][Math.floor(Math.random() * 4)],
          image: '/api/placeholder/300/200',
          category: subcategory.name,
          featured: i < 3
        }))
      ]);
  };

  const subcategoryListings = getSubcategoryListings();
  
  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      condition: [],
      location: 'all',
      brands: [],
      transmission: 'any',
      mileage: [0, 200000],
      searchTerm: ''
    });
  };

  if (!categoryData || !subcategory) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Subcategory not found
              </h1>
              <p className="text-gray-600 mb-4">
                The subcategory you're looking for doesn't exist.
              </p>
              <Button asChild>
                <a href="/categories">Browse All Categories</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">{subcategory.name}</h1>
            <p className="text-lg mb-6">
              Find the best {subcategory.name.toLowerCase()} in Ethiopia
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Input
                type="text"
                placeholder={`Search for ${subcategory.name.toLowerCase()}...`}
                className="w-full h-12 pl-4 pr-12 text-black"
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
              <Button
                size="sm"
                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700"
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
          categorySlug={categorySlug}
          categoryName={categoryData.name}
          subcategorySlug={subcategorySlug}
          subcategoryName={subcategory.name}
        />

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <subcategory.icon className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {subcategory.count.toLocaleString()} total listings
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
          {/* Filters Sidebar - Always show on desktop, toggle on mobile */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Mobile Filter Toggle */}
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
            
            {/* Filter Component - Always visible on desktop */}
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
              <h2 className="text-xl font-semibold mb-4">Featured {subcategory.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subcategoryListings.slice(0, 3).map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gray-200 h-40 flex items-center justify-center relative">
                      <Package className="w-12 h-12 text-gray-400" />
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Featured</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{listing.title}</h3>
                      <p className="text-blue-600 font-bold text-lg mb-2">{listing.price}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {listing.location}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Listings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All {subcategory.name}</h2>
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
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Selling {subcategory.name}?
            </h2>
            <p className="text-gray-600 mb-6">
              Reach thousands of potential buyers across Ethiopia
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Post Your {subcategory.name} Ad
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}