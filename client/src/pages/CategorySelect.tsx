import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  nameAm?: string;
  slug: string;
  description?: string;
}

export default function CategorySelect() {
  const [, navigate] = useLocation();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    // Navigate to category-specific posting form
    navigate(`/post?category=${categoryId}&name=${encodeURIComponent(categoryName)}`);
  };

  // Categories that don't need condition field (houses, services, etc.)
  const categoriesWithoutCondition = ['real-estate', 'services', 'jobs'];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Select Category</h1>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Choose the category that best describes your item to create a tailored listing form.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => handleCategorySelect(category.id, category.name)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    {category.name}
                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {category.description || `Post items in the ${category.name.toLowerCase()} category`}
                  </p>
                  {categoriesWithoutCondition.includes(category.slug) && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Simplified Form
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Access for Popular Categories */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Popular Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
                onClick={() => handleCategorySelect(category.id, category.name)}
                className="text-sm"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}