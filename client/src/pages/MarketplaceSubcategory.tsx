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
import { useLanguage } from '@/contexts/LanguageContext';
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

// Marketplace category data with translations
const getMarketplaceData = (t: (key: string) => string) => ({
  'antiques-art': {
    nameKey: 'subcategories.jewelry',
    icon: Palette,
    descriptionKey: 'categories.healthBeauty.desc',
    subcategories: [
      { nameKey: 'subcategories.jewelry', icon: Palette, count: 340 },
      { nameKey: 'subcategories.jewelry', icon: Palette, count: 125 },
      { nameKey: 'subcategories.furniture', icon: Sofa, count: 230 },
      { nameKey: 'subcategories.jewelry', icon: Star, count: 180 },
      { nameKey: 'subcategories.accessories', icon: Package, count: 95 },
      { nameKey: 'subcategories.jewelry', icon: Star, count: 280 }
    ]
  },
  'mobile-phones': {
    nameKey: 'subcategories.mobilePhones',
    icon: Smartphone,
    descriptionKey: 'categories.electronics.desc',
    subcategories: [
      { nameKey: 'subcategories.mobilePhones', icon: Smartphone, count: 890 },
      { nameKey: 'subcategories.mobilePhones', icon: Smartphone, count: 1250 },
      { nameKey: 'subcategories.mobilePhones', icon: Smartphone, count: 450 },
      { nameKey: 'subcategories.mobilePhones', icon: Smartphone, count: 320 },
      { nameKey: 'subcategories.mobilePhones', icon: Smartphone, count: 180 },
      { nameKey: 'subcategories.mobilePhones', icon: Smartphone, count: 330 }
    ]
  },
  'electronics-appliances': {
    nameKey: 'categories.electronics',
    icon: Smartphone,
    descriptionKey: 'categories.electronics.desc',
    subcategories: [
      { nameKey: 'subcategories.computers', icon: Package, count: 520 },
      { nameKey: 'subcategories.audioVideo', icon: Package, count: 340 },
      { nameKey: 'subcategories.appliances', icon: Package, count: 280 },
      { nameKey: 'subcategories.gaming', icon: Gamepad2, count: 150 },
      { nameKey: 'subcategories.cameras', icon: Package, count: 95 },
      { nameKey: 'subcategories.appliances', icon: Package, count: 120 }
    ]
  }
});

export default function MarketplaceSubcategory() {
  const { t } = useLanguage();
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
  const marketplaceData = getMarketplaceData(t);
  const categoryData = categorySlug && categorySlug in marketplaceData 
    ? marketplaceData[categorySlug as keyof typeof marketplaceData] 
    : null;

  // Generate category-specific listings
  const getCategoryListings = () => {
    if (!categoryData) return [];
    
    return Array.from({ length: 18 }, (_, i) => ({
      id: `mp-${categorySlug}-${i}`,
      title: `${t(categoryData.nameKey)} Item ${i + 1}`,
      price: `${Math.floor(Math.random() * 30000 + 5000).toLocaleString()} ETB`,
      location: ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa'][Math.floor(Math.random() * 4)],
      image: '/api/placeholder/300/200',
      category: t(categoryData.nameKey),
      views: Math.floor(Math.random() * 500 + 50),
      timeLeft: ['2 hours', '1 day', '3 days', '1 week'][Math.floor(Math.random() * 4)],
      isFinished: i < 3 && Math.random() > 0.7,
      isUseful: i < 6 && Math.random() > 0.5
    }));
  };

  const categoryListings = getCategoryListings();

  const clearAllFilters = () => {
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
                {t('empty.noResults')}
              </h1>
              <p className="text-gray-600 mb-4">
                {t('empty.tryDifferentSearch')}
              </p>
              <Button asChild>
                <a href="/marketplace">{t('marketplace.backToMarketplace')}</a>
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
              <h1 className="text-3xl font-bold">{t(categoryData.nameKey)}</h1>
            </div>
            <p className="text-lg mb-6">
              {t(categoryData.descriptionKey)}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Input
                type="text"
                placeholder={`${t('search.placeholder')}...`}
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
          categoryName={t('marketplace.title')}
          subcategorySlug={categorySlug}
          subcategoryName={t(categoryData.nameKey)}
        />

        {/* Subcategories Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('categories.title')} {t(categoryData.nameKey)}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryData.subcategories.map((subcategory, index) => (
              <Card 
                key={index} 
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => window.location.href = `/marketplace/${categorySlug}/${t(subcategory.nameKey).toLowerCase().replace(/\s+/g, '-').replace(/[&']/g, '')}`}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-cyan-100 transition-colors">
                    <subcategory.icon className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{t(subcategory.nameKey)}</h3>
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
                  {categoryListings.length.toLocaleString()} {t('listings.listings')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">{t('search.allEthiopia')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-600">{t('listings.featuredSubtitle')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('listings.featured')} {t(categoryData.nameKey)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryListings.slice(0, 3).map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative bg-gray-200 h-40 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                  
                  <div className="absolute top-2 left-2 flex gap-1">
                    {listing.isFinished && (
                      <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                        {t('listings.featuredBadge')}
                      </Badge>
                    )}
                    {listing.isUseful && (
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                        {t('stats.support')}
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
      </div>
    </Layout>
  );
}