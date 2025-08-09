import { Link } from "wouter";
// Removed useQuery - standalone operation
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchHero } from "@/components/SearchHero";
import { CategoryNav } from "@/components/CategoryNav";
import { Layout } from "@/components/Layout";
import { ListingCard } from "@/components/ListingCard";

import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Car, Home, Smartphone, Shirt, Plane, Briefcase, Wrench, Package, ShoppingBag, Users, Heart, Star } from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();

  // Mock data for standalone operation - no backend dependency
  const featuredListings = [];
  const featuredLoading = false;
  
  const recentListings = [];
  const recentLoading = false;

  // Static category data for Ethiopian market
  const staticCategories = [
    { name: 'Marketplace', icon: ShoppingBag, href: '/categories', color: 'bg-blue-50 text-blue-600' },
    { name: 'Cars & Vehicles', icon: Car, href: '/category/vehicles', color: 'bg-green-50 text-green-600' },
    { name: 'Travel', icon: Plane, href: '/category/travel', color: 'bg-purple-50 text-purple-600' },
    { name: 'Jobs', icon: Briefcase, href: '/category/jobs', color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Real Estate', icon: Home, href: '/category/real-estate', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Electronics', icon: Smartphone, href: '/category/electronics', color: 'bg-violet-50 text-violet-600' },
    { name: 'Tools & Equipment', icon: Wrench, href: '/category/tools', color: 'bg-amber-50 text-amber-600' },
    { name: 'Fashion', icon: Shirt, href: '/category/fashion', color: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <Layout>
      <SearchHero />
      <CategoryNav />
      
      {/* Static Category Grid - FINN.no Style */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {staticCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link key={index} href={category.href}>
                  <div className="group cursor-pointer p-4 rounded-xl hover:bg-gray-50 transition-colors text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${category.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("listings.featured")}
            </h2>
            <p className="text-lg text-gray-600">
              {t("listings.featuredSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="w-full h-48 rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : (featuredListings as any)?.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} featured />
                ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t("listings.recent")}
              </h2>
              <p className="text-gray-600">{t("listings.recentSubtitle")}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/categories">View All Categories</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="w-full h-48 rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : (recentListings as any)?.map((listing: any) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to EthioMarket
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            {t("stats.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose EthioMarket?
            </h2>
            <p className="text-lg text-gray-600">
              The most trusted marketplace in Ethiopia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
                <p className="text-gray-600">
                  Post your ads in minutes with our simple and intuitive
                  interface
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
                <p className="text-gray-600">
                  All users are verified and transactions are protected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Local Focus</h3>
                <p className="text-gray-600">
                  Connect with buyers and sellers in your area
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{t("stats.title")}</h2>
            <p className="text-primary-100">{t("stats.subtitle")}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-primary-100 text-sm">
                {t("stats.activeListings")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">25K+</div>
              <div className="text-primary-100 text-sm">
                {t("stats.happyUsers")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-primary-100 text-sm">
                {t("stats.successRate")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-primary-100 text-sm">
                {t("stats.support")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users buying and selling on EthioMarket
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-white hover:bg-primary/90"
          >
            <a href="/api/login">Login to Get Started</a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
