import React, { useState } from 'react';
import { useParams } from 'wouter';
import { Layout } from '@/components/Layout';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Heart, Star, MapPin, Clock, Zap } from 'lucide-react';
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

const MARKETPLACE_CATEGORIES = [
  {
    id: 'antiques-art',
    name: 'Antiques and art',
    icon: Palette,
    count: 1250,
    description: 'Unique collectibles and artistic pieces'
  },
  {
    id: 'mobile-phones',
    name: 'Newly used mobile phone',
    icon: Smartphone,
    count: 3420,
    description: 'Quality pre-owned smartphones',
    isNew: true
  },
  {
    id: 'garden-house',
    name: 'Garden, renovation and house',
    icon: Wrench,
    count: 2180,
    description: 'Home improvement and garden supplies'
  },
  {
    id: 'business-activities',
    name: 'Business activities',
    icon: Briefcase,
    count: 890,
    description: 'Commercial and business services'
  },
  {
    id: 'animals-equipment',
    name: 'Animals and equipment',
    icon: PawPrint,
    count: 560,
    description: 'Pet supplies and animal care'
  },
  {
    id: 'parents-children',
    name: 'Parents and children',
    icon: Baby,
    count: 1760,
    description: 'Family and children related items'
  },
  {
    id: 'clothing-accessories',
    name: 'Clothing, cosmetics and accessories',
    icon: ShoppingCart,
    count: 4230,
    description: 'Fashion and personal care items'
  },
  {
    id: 'sports-outdoor',
    name: 'Sports and outdoor activities',
    icon: Dumbbell,
    count: 1540,
    description: 'Sporting goods and outdoor gear'
  },
  {
    id: 'electronics-appliances',
    name: 'Electronics and appliances',
    icon: Smartphone,
    count: 2890,
    description: 'Electronic devices and home appliances'
  },
  {
    id: 'leisure-hobbies',
    name: 'Leisure, hobbies and entertainment',
    icon: Gamepad2,
    count: 1320,
    description: 'Entertainment and hobby items'
  },
  {
    id: 'furniture-interior',
    name: 'Furniture and interior',
    icon: Sofa,
    count: 1980,
    description: 'Home furniture and decor'
  },
  {
    id: 'equipment-vehicles',
    name: 'Equipment for cars, boats and motorcycles',
    icon: Wrench,
    count: 720,
    description: 'Vehicle parts and accessories'
  }
];

const FEATURED_LISTINGS = [
  {
    id: 1,
    title: 'Vintage Art Collection',
    price: '15,000 ETB',
    location: 'Addis Ababa',
    category: 'Antiques and art',
    image: '/api/placeholder/300/200',
    isFinished: true,
    views: 245,
    timeLeft: '2 days'
  },
  {
    id: 2,
    title: 'iPhone 13 Pro Max',
    price: '45,000 ETB',
    location: 'Dire Dawa',
    category: 'Mobile phones',
    image: '/api/placeholder/300/200',
    isUseful: true,
    views: 892,
    timeLeft: '5 days'
  },
  {
    id: 3,
    title: 'Professional Makeup Kit',
    price: '8,500 ETB',
    location: 'Bahir Dar',
    category: 'Clothing and accessories',
    image: '/api/placeholder/300/200',
    isFinished: true,
    views: 156,
    timeLeft: '1 day'
  }
];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = MARKETPLACE_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 rounded-full p-3 mr-4">
                <Package className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold">The Square</h1>
            </div>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Ethiopia's premier marketplace for buying and selling quality goods
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <Input
                type="text"
                placeholder="Search the square..."
                className="w-full h-14 pl-6 pr-14 text-black text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                size="lg"
                className="absolute right-2 top-2 bg-cyan-600 hover:bg-cyan-700"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>

            {/* Shipping Promotion */}
            <div className="bg-cyan-400/30 rounded-xl p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="w-6 h-6 mr-3" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">-50% off shipping with Fix it!</h3>
                    <p className="text-sm opacity-90">
                      Applies to small packages with Hetthem and PostNord August 3-17. Secure payment applies.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  FIX IT!
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation />

        {/* Categories Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => {
              return (
                <Card 
                  key={category.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 shadow-sm bg-white"
                  onClick={() => window.location.href = `/marketplace/${category.id}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl flex items-center justify-center mx-auto group-hover:from-cyan-100 group-hover:to-blue-100 transition-colors">
                        <category.icon className="w-8 h-8 text-cyan-600" />
                      </div>
                      {category.isNew && (
                        <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1">
                          New!
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2 text-sm leading-tight">{category.name}</h3>
                    <p className="text-cyan-600 font-medium text-sm">{category.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Popular Ads Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular ads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_LISTINGS.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative bg-gray-200 h-48 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {listing.isFinished && (
                      <Badge className="bg-yellow-500 text-white text-xs">
                        Finished
                      </Badge>
                    )}
                    {listing.isUseful && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        Useful articles
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white group-hover:bg-white"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>

                  {/* Views Counter */}
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {listing.views} views
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
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-cyan-600 mb-2">50K+</div>
              <div className="text-gray-600">Active Listings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600 mb-2">15K+</div>
              <div className="text-gray-600">Happy Sellers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600 mb-2">25K+</div>
              <div className="text-gray-600">Satisfied Buyers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-600 mb-2">99%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </section>

        {/* Selling CTA */}
        <section className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Start Selling on The Square
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of successful sellers and reach customers across Ethiopia. 
            List your items quickly and start earning today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
              <Package className="w-5 h-5 mr-2" />
              Post Your First Ad
            </Button>
            <Button size="lg" variant="outline">
              Learn How to Sell
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
}