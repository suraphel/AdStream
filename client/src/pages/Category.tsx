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
  Building
} from 'lucide-react';
import { formatNumber } from '@/lib/i18n';
import { getCategoryGroup, type CategoryGroupKey } from '@/lib/categoryGroups';

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

  const { data: categories, isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const { data: category, isLoading: categoryLoading } = useQuery<any>({
    queryKey: ['/api/categories', slug],
    enabled: !!slug && !isOverview,
  });

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/listings', category?.id, filters, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category?.id) params.append('category', category.id.toString());
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.location && filters.location !== '') params.append('location', filters.location);
      if (filters.condition.length > 0) params.append('condition', filters.condition.join(','));
      if (filters.brands.length > 0) params.append('brands', filters.brands.join(','));
      if (filters.transmission) params.append('transmission', filters.transmission);
      params.append('priceMin', filters.priceRange[0].toString());
      params.append('priceMax', filters.priceRange[1].toString());
      if (filters.mileage) {
        params.append('mileageMin', filters.mileage[0].toString());
        params.append('mileageMax', filters.mileage[1].toString());
      }
      params.append('sort', sortBy);
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch listings');
      return response.json();
    },
    enabled: !isOverview && !!category,
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation 
            categorySlug={slug}
            categoryName={category.name}
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
                        {category.name}
                      </h1>
                      {category.nameAm && language === 'am' && (
                        <p className="text-gray-600 mt-1">{category.nameAm}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-gray-600 mb-4">
                    {language === 'am' && category.descriptionAm ? category.descriptionAm : category.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {formatNumber(listings?.length || 0, language)} listings found
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
              {listingsLoading ? (
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
              ) : listings && listings.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
                  {listings.map((listing: any) => (
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
