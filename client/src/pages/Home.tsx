import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/Layout';
import { SearchHero } from '@/components/SearchHero';
import { CategoryNav } from '@/components/CategoryNav';
import { ListingCard } from '@/components/ListingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/i18n';
import { Plus, FileText, Building2 } from 'lucide-react';

export default function Home() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    search: '',
    category: '',
    location: '',
  });

  const { data: featuredListings, isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/listings?featured=true&limit=4'],
  });

  const { data: recentListings, isLoading: recentLoading } = useQuery({
    queryKey: [`/api/listings?limit=8${searchParams.search ? `&search=${encodeURIComponent(searchParams.search)}` : ''}${searchParams.category ? `&category=${searchParams.category}` : ''}${searchParams.location ? `&location=${encodeURIComponent(searchParams.location)}` : ''}`],
  });

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
    if (params.search || params.category || params.location) {
      const searchQuery = new URLSearchParams();
      if (params.search) searchQuery.set('search', params.search);
      if (params.category) searchQuery.set('category', params.category);
      if (params.location) searchQuery.set('location', params.location);
      setLocation(`/search?${searchQuery.toString()}`);
    }
  };

  return (
    <Layout>
      <SearchHero onSearch={handleSearch} />
      <CategoryNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t('listings.featured')}
              </h2>
              <p className="text-gray-600">
                {t('listings.featuredSubtitle')}
              </p>
            </div>
            <a href="#" className="text-primary font-medium hover:text-primary/80 transition-colors">
              {t('listings.viewAllFeatured')}
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full h-48 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              (featuredListings as any)?.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} featured />
              ))
            )}
          </div>
        </section>

        {/* Recent Listings */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t('listings.recent')}
              </h2>
              <p className="text-gray-600">
                {t('listings.recentSubtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                <option>Most Recent</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full h-48 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              (recentListings as any)?.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              {t('listings.loadMore')}
            </Button>
          </div>
        </section>

        {/* Tender Services Section */}
        <section className="bg-blue-50 rounded-xl p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">TenderFloat Services</h2>
            <p className="text-gray-600">Access professional tender document services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Register as User</h3>
                <p className="text-gray-600 mb-4">
                  Purchase and download tender documents from verified companies
                </p>
                <Link href="/tender/register-user">
                  <Button className="w-full">
                    Register for Tender Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Register as Company</h3>
                <p className="text-gray-600 mb-4">
                  Upload and sell your tender documents to interested buyers
                </p>
                <Link href="/tender/register-company">
                  <Button variant="outline" className="w-full">
                    Register Company Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-white mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{t('stats.title')}</h2>
            <p className="text-primary-100">{t('stats.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {formatNumber(127000, language)}+
              </div>
              <div className="text-primary-100 text-sm">{t('stats.activeListings')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {formatNumber(45000, language)}+
              </div>
              <div className="text-primary-100 text-sm">{t('stats.happyUsers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-primary-100 text-sm">{t('stats.successRate')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-primary-100 text-sm">{t('stats.support')}</div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="icon"
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
          asChild
        >
          <a href="/post">
            <Plus className="w-6 h-6" />
          </a>
        </Button>
      </div>
    </Layout>
  );
}
