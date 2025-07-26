import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_GROUPS, getCategoryGroup, getGroupColor, type CategoryGroupKey } from '@/lib/categoryGroups';
import { getCategoryIcon } from '@/lib/categoryUtils';

interface Category {
  id: number;
  name: string;
  nameAm?: string;
  slug: string;
  groupName?: string;
  listingCount?: number;
}

export default function EnhancedCategories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {Object.keys(CATEGORY_GROUPS).map((groupKey) => (
              <div key={groupKey} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Group categories by their category groups
  const groupedCategories = categories.reduce((acc, category) => {
    const groupKey = getCategoryGroup(category.slug) || 'services';
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(category);
    return acc;
  }, {} as Record<CategoryGroupKey, Category[]>);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Categories</h1>
          <p className="text-gray-600">
            Find exactly what you're looking for by browsing our organized category groups
          </p>
        </div>

        {/* Category Groups */}
        <div className="space-y-10">
          {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => {
            const groupCategories = groupedCategories[groupKey as CategoryGroupKey] || [];
            
            if (groupCategories.length === 0) return null;

            const GroupIcon = group.icon;
            const colorClass = getGroupColor(groupKey as CategoryGroupKey);

            return (
              <div key={groupKey} className="space-y-4">
                {/* Group Header */}
                <div className="flex items-center space-x-3">
                  <div className={`p-3 bg-${colorClass}-100 rounded-xl w-fit`}>
                    <GroupIcon className={`h-6 w-6 text-${colorClass}-600`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
                    <p className="text-gray-600">{group.nameAm}</p>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupCategories.map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group border-border hover:border-primary/20 bg-white">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className={`p-2 bg-${colorClass}-50 rounded-lg w-fit`}>
                              {React.createElement(getCategoryIcon(category.slug), {
                                className: `h-5 w-5 text-${colorClass}-600`
                              })}
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {category.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {category.listingCount !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              {category.listingCount} listings
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => {
              const groupCategories = groupedCategories[groupKey as CategoryGroupKey] || [];
              const totalListings = groupCategories.reduce((sum, cat) => sum + (cat.listingCount || 0), 0);
              const GroupIcon = group.icon;
              const colorClass = getGroupColor(groupKey as CategoryGroupKey);

              return (
                <div key={groupKey} className="text-center">
                  <div className={`p-3 bg-${colorClass}-100 rounded-xl w-fit mx-auto mb-2`}>
                    <GroupIcon className={`h-5 w-5 text-${colorClass}-600`} />
                  </div>
                  <p className="font-medium text-sm text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-500">{totalListings} items</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}