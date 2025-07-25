import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package } from 'lucide-react';
import { getCategoryIcon } from '@/lib/categoryUtils';

interface Category {
  id: number;
  name: string;
  nameAm?: string;
  slug: string;
  description?: string;
  listingCount?: number;
}

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Categories</h1>
          <p className="text-gray-600">
            Find exactly what you're looking for by browsing our organized categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-border hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg w-fit">
                      {React.createElement(getCategoryIcon(category.slug), {
                        className: "h-6 w-6 text-primary"
                      })}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {category.description || `Browse all ${category.name.toLowerCase()} listings`}
                  </p>
                  {category.listingCount !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {category.listingCount} listing{category.listingCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-muted-foreground">
              Categories are being set up. Please check back later.
            </p>
          </div>
        )}

        {/* Popular Categories Quick Access */}
        {categories.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                  >
                    {category.name}
                    {category.listingCount !== undefined && (
                      <span className="ml-2 text-xs opacity-70">
                        ({category.listingCount})
                      </span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}