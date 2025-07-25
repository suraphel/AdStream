import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/Layout';
import { ListingCard } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Grid,
  List,
  SlidersHorizontal,
  MapPin,
  Filter
} from 'lucide-react';
import { formatNumber } from '@/lib/i18n';

export default function Category() {
  const params = useParams();
  const [location] = useLocation();
  const { language, t } = useLanguage();
  const slug = params.slug;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // Check if this is the categories overview page
  const isOverview = location === '/categories' || !slug;

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['/api/categories', slug],
    enabled: !!slug && !isOverview,
  });

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/listings', {
      category: category?.id,
      search: searchTerm || undefined,
      location: selectedLocation || undefined,
      sort: sortBy,
    }],
    enabled: !isOverview && !!category,
  });

  const locations = [
    { value: 'all', label: t('search.allEthiopia') },
    { value: 'addis-ababa', label: t('cities.addisAbaba') },
    { value: 'dire-dawa', label: t('cities.direDawa') },
    { value: 'bahir-dar', label: t('cities.bahirDar') },
    { value: 'gondar', label: t('cities.gondar') },
    { value: 'hawassa', label: t('cities.hawassa') },
    { value: 'mekelle', label: t('cities.mekelle') },
    { value: 'jimma', label: t('cities.jimma') },
    { value: 'adama', label: t('cities.adama') },
    { value: 'dessie', label: t('cities.dessie') },
    { value: 'debre-markos', label: t('cities.debreMarkos') },
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ];

  if (isOverview) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('categories.title')}
            </h1>
            <p className="text-lg text-gray-600">
              Explore all categories and find what you're looking for
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-5 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories?.map((category: any) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <a href={`/category/${category.slug}`}>
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <div className="w-8 h-8 bg-primary/20 rounded"></div>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {language === 'am' && category.nameAm ? category.nameAm : category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatNumber(category.listingCount, language)} {t('categories.ads')}
                      </p>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (categoryLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Category not found
              </h1>
              <p className="text-gray-600 mb-4">
                The category you're looking for doesn't exist.
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'am' && category.nameAm ? category.nameAm : category.name}
          </h1>
          <p className="text-lg text-gray-600">
            {formatNumber(listings?.length || 0, language)} listings found
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search in this category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Location */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="0-1000">Under ETB 1,000</SelectItem>
                  <SelectItem value="1000-5000">ETB 1,000 - 5,000</SelectItem>
                  <SelectItem value="5000-10000">ETB 5,000 - 10,000</SelectItem>
                  <SelectItem value="10000-50000">ETB 10,000 - 50,000</SelectItem>
                  <SelectItem value="50000+">Over ETB 50,000</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="ghost" className="text-primary">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        {listingsLoading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : listings?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No listings found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or browse other categories
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" asChild>
                  <a href="/categories">Browse Categories</a>
                </Button>
                <Button asChild>
                  <a href="/">Back to Home</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {listings?.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                Load More Listings
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
