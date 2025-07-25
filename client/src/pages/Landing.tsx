import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchHero } from '@/components/SearchHero';
import { CategoryNav } from '@/components/CategoryNav';
import { Layout } from '@/components/Layout';
import { Plus } from 'lucide-react';

export default function Landing() {
  const { t } = useLanguage();

  return (
    <Layout>
      <SearchHero />
      <CategoryNav />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to EthioMarket
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            {t('stats.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <a href="/api/login">
                Get Started - Sign Up Free
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              <Link href="/categories">
                Browse Categories
              </Link>
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
                  Post your ads in minutes with our simple and intuitive interface
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
            <h2 className="text-3xl font-bold mb-2">{t('stats.title')}</h2>
            <p className="text-primary-100">{t('stats.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-primary-100 text-sm">{t('stats.activeListings')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">25K+</div>
              <div className="text-primary-100 text-sm">{t('stats.happyUsers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-primary-100 text-sm">{t('stats.successRate')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-primary-100 text-sm">{t('stats.support')}</div>
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
          <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90">
            <a href="/api/login">
              <Plus className="w-5 h-5 mr-2" />
              Start Selling Today
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
