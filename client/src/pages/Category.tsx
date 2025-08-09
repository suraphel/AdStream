import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/Layout';
import { ListingCard } from '@/components/ListingCard';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { FilterSidebar, type FilterState } from '@/components/FilterSidebar';
import { SubcategoryGrid } from '@/components/SubcategoryGrid';
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
  Filter,
  ExternalLink,
  Building,
  Heart,
  Package
} from 'lucide-react';
import { formatNumber } from '@/lib/i18n';
import { getCategoryGroup, type CategoryGroupKey } from '@/lib/categoryGroups';
import { getStaticCategoryData } from '@/lib/staticCategoryData';
import { useBackendStatus } from '@/hooks/useBackendStatus';

export default function Category() {
  const params = useParams();
  const [location] = useLocation();
  const { language, t } = useLanguage();
  const slug = params.slug;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000000],
    condition: [],
    location: 'all',
    brands: [],
    transmission: 'any',
    mileage: [0, 200000],
    searchTerm: ''
  });

  // Check if this is the categories overview page
  const isOverview = location === '/categories' || !slug;
  
  // Get backend status
  const { isBackendAvailable } = useBackendStatus();

  // Get static category data
  const staticCategoryData = slug ? getStaticCategoryData(slug) : null;

  // Use API data if backend is available, otherwise use static data
  const { data: categories, isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ['/api/categories'],
    enabled: isBackendAvailable && isOverview,
  });

  const { data: category, isLoading: categoryLoading } = useQuery<any>({
    queryKey: ['/api/categories', slug],
    enabled: isBackendAvailable && !!slug && !isOverview,
  });

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/listings', category?.id, filters, sortBy],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    enabled: isBackendAvailable && !isOverview && !!category?.id,
  });

  // Get category group information
  const categoryGroup = slug ? getCategoryGroup(slug) : null;
  const isRealEstateCategory = slug === 'real-estate';

  // Auto-hide filters on mobile after applying
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowFilters(false);
    }
  }, [filters]);

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
                <Card key={category.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <a href={`/category/${category.slug}`} className="block">
                    <div className="relative">
                      {category.icon ? (
                        <img 
                          src={category.icon} 
                          alt={category.name}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-colors"></div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="font-semibold text-lg text-white mb-1">
                          {language === 'am' && category.nameAm ? category.nameAm : category.name}
                        </h3>
                        <p className="text-sm text-white/80">
                          {formatNumber(category.listingCount || 0, language)} {t('categories.ads')}
                        </p>
                      </div>
                    </div>
                  </a>
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

  // Use static data if no backend or no API category data
  const currentCategory = category || (staticCategoryData ? { 
    name: staticCategoryData.name, 
    description: staticCategoryData.description,
    slug: slug
  } : null);

  const currentListings = listings || (staticCategoryData ? staticCategoryData.featuredListings : []);

  if (!currentCategory && !staticCategoryData) {
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

  // Show static FINN.no-style layout when using static data
  if (staticCategoryData && !isBackendAvailable) {
    return (
      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">{staticCategoryData.heroTitle}</h1>
              <p className="text-xl mb-8">{staticCategoryData.heroSubtitle}</p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative mb-8">
                <Input
                  type="text"
                  placeholder={`Search for ${staticCategoryData.name.toLowerCase()}...`}
                  className="w-full h-12 pl-4 pr-12 text-black"
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

        {/* Subcategories Grid */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {staticCategoryData.subcategories.map((subcategory, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <subcategory.icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{subcategory.name}</h3>
                    <p className="text-gray-500 text-sm">{subcategory.count.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sell Section */}
            <div className="bg-gray-50 rounded-xl p-8 mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{staticCategoryData.sellSection.title}</h2>
                <p className="text-gray-600">{staticCategoryData.sellSection.subtitle}</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  {staticCategoryData.sellSection.buttonText}
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-8">Featured {staticCategoryData.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staticCategoryData.featuredListings.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gray-200 h-48 flex items-center justify-center relative">
                    <Package className="w-16 h-16 text-gray-400" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                    </div>
                    <p className="text-blue-600 font-bold text-lg mb-2">{item.price}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {item.location}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation 
            categorySlug={slug}
            categoryName={currentCategory?.name || slug || ''}
          />

          {/* Show subcategories if this is a main category group page */}
          {categoryGroup && (
            <SubcategoryGrid 
              groupKey={categoryGroup}
              currentCategorySlug={slug}
            />
          )}

          {/* Layout Container */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            <FilterSidebar
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
              filters={filters}
              onFiltersChange={setFilters}
              categorySlug={slug}
              className="lg:w-80 flex-shrink-0"
            />

            {/* Main Content */}
            <div className="flex-1">
              {/* Category Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {currentCategory?.name || slug}
                      </h1>
                      {currentCategory?.nameAm && language === 'am' && (
                        <p className="text-gray-600 mt-1">{currentCategory.nameAm}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {currentCategory?.description && (
                  <p className="text-gray-600 mb-4">
                    {language === 'am' && currentCategory.descriptionAm ? currentCategory.descriptionAm : currentCategory.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {formatNumber(currentListings?.length || 0, language)} listings found
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4 mr-1" />
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4 mr-1" />
                      List
                    </Button>
                  </div>
                </div>
              </div>

              {/* Listings Grid/List */}
              {(listingsLoading && isBackendAvailable) ? (
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
              ) : currentListings && currentListings.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
                  {currentListings.map((listing: any) => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                  <p className="text-gray-500 mb-6">
                    No listings match your current filters in this category.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({
                      priceRange: [0, 1000000],
                      condition: [],
                      location: 'all',
                      brands: [],
                      transmission: 'any',
                      mileage: [0, 200000],
                      searchTerm: ''
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* External Listings Section for Real Estate */}
          {isRealEstateCategory && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  External Real Estate Listings
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access thousands of additional property listings from trusted external platforms
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => window.location.href = '/external'}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Browse External Listings
                  </Button>
                  <Button variant="outline" size="sm">
                    RentCast Properties
                  </Button>
                  <Button variant="outline" size="sm">
                    Zillow Data
                  </Button>
                  <Button variant="outline" size="sm">
                    More Sources
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
