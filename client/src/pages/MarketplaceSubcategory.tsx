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
import { 
  Palette, 
  Smartphone, 
  Baby, 
  Briefcase, 
  ShoppingCart,
  Sofa,
  Users,
  Gamepad2,
  Dumbbell,
  Wrench,
  PawPrint
} from 'lucide-react';

interface FilterState {
  priceRange: [number, number];
  condition: string[];
  location: string;
  brands: string[];
  transmission: string;
  mileage: [number, number];
  searchTerm: string;
}

// Marketplace category data with subcategories
const MARKETPLACE_DATA = {
  'antiques-art': {
    name: 'Antiques and art',
    icon: Palette,
    description: 'Discover unique collectibles, vintage items, and artistic pieces',
    subcategories: [
      { name: 'Paintings', icon: Palette, count: 340 },
      { name: 'Sculptures', icon: Palette, count: 125 },
      { name: 'Vintage Furniture', icon: Sofa, count: 230 },
      { name: 'Collectibles', icon: Star, count: 180 },
      { name: 'Antique Books', icon: Package, count: 95 },
      { name: 'Vintage Jewelry', icon: Star, count: 280 }
    ]
  },
  'mobile-phones': {
    name: 'Newly used mobile phone',
    icon: Smartphone,
    description: 'Quality pre-owned smartphones from trusted sellers',
    subcategories: [
      { name: 'iPhone', icon: Smartphone, count: 890 },
      { name: 'Samsung', icon: Smartphone, count: 1250 },
      { name: 'Huawei', icon: Smartphone, count: 450 },
      { name: 'Xiaomi', icon: Smartphone, count: 320 },
      { name: 'OnePlus', icon: Smartphone, count: 180 },
      { name: 'Other Brands', icon: Smartphone, count: 330 }
    ]
  },
  'electronics-appliances': {
    name: 'Electronics and appliances',
    icon: Smartphone,
    description: 'Electronic devices and home appliances for modern living',
    subcategories: [
      { name: 'Laptops & Computers', icon: Package, count: 520 },
      { name: 'TVs & Audio', icon: Package, count: 340 },
      { name: 'Kitchen Appliances', icon: Package, count: 280 },
      { name: 'Gaming Consoles', icon: Gamepad2, count: 150 },
      { name: 'Cameras', icon: Package, count: 95 },
      { name: 'Smart Home', icon: Package, count: 120 }
    ]
  },
  'clothing-accessories': {
    name: 'Clothing, cosmetics and accessories',
    icon: ShoppingCart,
    description: 'Fashion items, beauty products, and stylish accessories',
    subcategories: [
      { name: "Men's Clothing", icon: ShoppingCart, count: 780 },
      { name: "Women's Clothing", icon: ShoppingCart, count: 1250 },
      { name: 'Shoes', icon: ShoppingCart, count: 650 },
      { name: 'Bags & Accessories', icon: ShoppingCart, count: 420 },
      { name: 'Cosmetics', icon: ShoppingCart, count: 380 },
      { name: 'Jewelry', icon: Star, count: 310 }
    ]
  }
};

export default function MarketplaceSubcategory() {
  const params = useParams();
  const categorySlug = params.category;
  
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

  // Get category data
  const categoryData = categorySlug && categorySlug in MARKETPLACE_DATA 
    ? MARKETPLACE_DATA[categorySlug as keyof typeof MARKETPLACE_DATA] 
    : null;

  // Generate category-specific listings
  const getCategoryListings = () => {
    if (!categoryData) return [];
    
    return Array.from({ length: 18 }, (_, i) => ({
      id: `mp-${categorySlug}-${i}`,
      title: `${categoryData.name} Item ${i + 1}`,
      price: `${Math.floor(Math.random() * 30000 + 5000).toLocaleString()} ETB`,
      location: ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa'][Math.floor(Math.random() * 4)],
      image: '/api/placeholder/300/200',
      category: categoryData.name,
      views: Math.floor(Math.random() * 500 + 50),
      timeLeft: ['2 hours', '1 day', '3 days', '1 week'][Math.floor(Math.random() * 4)],
      isFinished: i < 3 && Math.random() > 0.7,
      isUseful: i < 6 && Math.random() > 0.5
    }));
  };

  const categoryListings = getCategoryListings();
  
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

  if (!categoryData) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Category not found
              </h1>
              <p className="text-gray-600 mb-4">
                The marketplace category you're looking for doesn't exist.
              </p>
              <Button asChild>
                <a href="/marketplace">Browse Marketplace</a>
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
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <categoryData.icon className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold">{categoryData.name}</h1>
            </div>
            <p className="text-lg mb-6">
              {categoryData.description}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Input
                type="text"
                placeholder={`Search in ${categoryData.name.toLowerCase()}...`}
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
          subcategoryName={categoryData.name}
        />

        {/* Subcategories Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Browse {categoryData.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryData.subcategories.map((subcategory, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => window.location.href = `/marketplace/${categorySlug}/${subcategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[&']/g, '')}`}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-cyan-100 transition-colors">
                    <subcategory.icon className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{subcategory.name}</h3>
                  <p className="text-cyan-600 text-xs">{subcategory.count.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-cyan-600" />
                <span className="text-sm text-gray-600">
                  {categoryListings.length.toLocaleString()} total listings
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
              <h2 className="text-xl font-semibold mb-4">Featured {categoryData.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryListings.slice(0, 3).map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative bg-gray-200 h-40 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                      
                      <div className="absolute top-2 left-2 flex gap-1">
                        {listing.isFinished && (
                          <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                            Finished
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
              <h2 className="text-xl font-semibold mb-4">All {categoryData.name}</h2>
              <ListingGrid
                listings={categoryListings.slice(3)}
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
              Selling {categoryData.name}?
            </h2>
            <p className="text-gray-600 mb-6">
              Join The Square marketplace and reach thousands of buyers
            </p>
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
              <Package className="w-5 h-5 mr-2" />
              Post Your Ad
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}