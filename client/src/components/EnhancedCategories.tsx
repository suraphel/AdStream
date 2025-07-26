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
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse Categories</h2>
          <p className="text-gray-600">Find exactly what you're looking for</p>
        </div>

        {/* Clean Grid Layout Similar to FINN.no */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {categories.slice(0, 16).map((category) => {
            const IconComponent = getCategoryIcon(category.slug);
            const groupKey = getCategoryGroup(category.slug) || 'services';
            const colorClass = getGroupColor(groupKey as CategoryGroupKey);
            
            return (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <div className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 group cursor-pointer border border-gray-100 hover:border-blue-200">
                  <div className={`w-12 h-12 bg-${colorClass}-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-${colorClass}-200 transition-colors`}>
                    <IconComponent className={`w-6 h-6 text-${colorClass}-600`} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center leading-tight group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </span>
                  {category.listingCount !== undefined && (
                    <span className="text-xs text-gray-500 mt-1">
                      {category.listingCount} ads
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Link */}
        <div className="text-center mt-10">
          <Link href="/categories">
            <button className="px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg font-medium shadow-sm">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default EnhancedCategories;