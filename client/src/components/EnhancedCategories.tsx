import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
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

export function EnhancedCategories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {Object.keys(CATEGORY_GROUPS).slice(0, 3).map((groupKey) => (
              <div key={groupKey} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-600">Find exactly what you're looking for in organized groups</p>
        </div>

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
                    <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                    <p className="text-gray-600 text-sm">{group.nameAm}</p>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {groupCategories.slice(0, 6).map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`}>
                      <Card className="h-full hover:shadow-md transition-all duration-200 cursor-pointer group border-border hover:border-primary/20 bg-white">
                        <CardContent className="p-4 text-center">
                          <div className={`p-3 bg-${colorClass}-50 rounded-lg w-fit mx-auto mb-3`}>
                            {React.createElement(getCategoryIcon(category.slug), {
                              className: `h-6 w-6 text-${colorClass}-600`
                            })}
                          </div>
                          <h4 className="font-medium text-sm text-gray-900 mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                          </h4>
                          {category.listingCount !== undefined && (
                            <p className="text-xs text-gray-500">
                              {category.listingCount} items
                            </p>
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

        {/* View All Categories Link */}
        <div className="text-center mt-8">
          <Link href="/categories">
            <button className="px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-lg font-medium">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default EnhancedCategories;