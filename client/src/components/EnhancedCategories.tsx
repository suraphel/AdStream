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

        {/* Category Groups - Clean Minimal Layout */}
        <div className="space-y-16">
          {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => {
            const groupCategories = groupedCategories[groupKey as CategoryGroupKey] || [];
            
            if (groupCategories.length === 0) return null;

            const colorClass = getGroupColor(groupKey as CategoryGroupKey);

            return (
              <div key={groupKey} className="space-y-8">
                {/* Group Header - Minimal */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{group.name}</h3>
                  <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
                </div>

                {/* Categories Grid - Clean Minimal Layout */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-8">
                  {groupCategories.slice(0, 10).map((category) => {
                    const IconComponent = getCategoryIcon(category.slug);
                    
                    return (
                      <Link key={category.id} href={`/category/${category.slug}`}>
                        <div className="flex flex-col items-center text-center group cursor-pointer">
                          <div className={`w-14 h-14 bg-${colorClass}-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-${colorClass}-200 transition-all duration-200 group-hover:scale-105`}>
                            <IconComponent className={`w-7 h-7 text-${colorClass}-600`} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 leading-tight group-hover:text-blue-600 transition-colors max-w-16">
                            {category.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
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