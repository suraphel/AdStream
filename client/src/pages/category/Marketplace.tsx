import React from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ShoppingBag, Package, Gift, Heart } from 'lucide-react';

export default function Marketplace() {
  const subcategories = [
    { name: 'Electronics', count: '12,543', href: '/category/electronics' },
    { name: 'Fashion & Clothing', count: '8,932', href: '/category/fashion' },
    { name: 'Home & Garden', count: '6,754', href: '/category/home-garden' },
    { name: 'Sports & Outdoor', count: '4,321', href: '/category/sports' },
    { name: 'Books & Media', count: '3,876', href: '/category/books' },
    { name: 'Toys & Games', count: '2,543', href: '/category/toys' },
    { name: 'Health & Beauty', count: '1,987', href: '/category/health' },
    { name: 'Collectibles', count: '1,234', href: '/category/collectibles' },
  ];

  const featuredListings = [
    { id: 1, title: 'Premium Headphones', price: '2,500 ETB', image: '/api/placeholder/300/200' },
    { id: 2, title: 'Designer Handbag', price: '1,800 ETB', image: '/api/placeholder/300/200' },
    { id: 3, title: 'Vintage Watch', price: '5,000 ETB', image: '/api/placeholder/300/200' },
    { id: 4, title: 'Smartphone Case', price: '350 ETB', image: '/api/placeholder/300/200' },
    { id: 5, title: 'Coffee Machine', price: '3,200 ETB', image: '/api/placeholder/300/200' },
    { id: 6, title: 'Running Shoes', price: '1,200 ETB', image: '/api/placeholder/300/200' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Looking for something special?</h1>
            <p className="text-xl mb-8">Browse thousands of items from trusted sellers across Ethiopia</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-8">
              <Input
                type="text"
                placeholder="Search for products, brands, or categories..."
                className="w-full h-12 pl-4 pr-12 text-black"
              />
              <Button
                size="sm"
                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Tabs */}
            <div className="flex justify-center space-x-8 text-sm">
              <span className="hover:text-blue-200 cursor-pointer">Buy</span>
              <span className="hover:text-blue-200 cursor-pointer">Rent</span>
              <span className="hover:text-blue-200 cursor-pointer">Sell</span>
              <span className="hover:text-blue-200 cursor-pointer">Services</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {subcategories.map((category, index) => (
              <Link key={index} href={category.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-gray-500 text-sm">{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Sell Section */}
          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <div className="text-center mb-6">
              <ShoppingBag className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Want to sell something?</h2>
              <p className="text-gray-600">Join thousands of sellers and reach customers nationwide</p>
            </div>
            <div className="flex justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Post New Ad
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Popular Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-blue-600 font-bold">{item.price}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
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