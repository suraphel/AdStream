import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Package, Sparkles } from 'lucide-react';
import { CATEGORY_GROUPS, getCategoryGroup, getGroupColor, type CategoryGroupKey } from '@/lib/categoryGroups';
import { getCategoryIcon } from '@/lib/categoryUtils';

interface Category {
  id: number;
  name: string;
  nameAm?: string;
  slug: string;
  groupName?: string;
  listingCount?: number;
  description?: string;
}

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
                  <Skeleton className="w-16 h-16 rounded-xl mx-auto mb-4" />
                  <Skeleton className="h-4 w-20 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
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
      <div className="bg-white">
        {/* Header */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">All Categories</h1>
              <p className="text-lg text-gray-600">Browse all available categories and find what you need</p>
            </div>
          </div>
        </div>

        {/* Clean Grid Layout - No Group Headers */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-10">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.slug);
              const groupKey = getCategoryGroup(category.slug) || 'services';
              const colorClass = getGroupColor(groupKey as CategoryGroupKey);
              
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <div className="flex flex-col items-center text-center group cursor-pointer">
                    {/* Icon Container - Minimal */}
                    <div className={`w-16 h-16 bg-${colorClass}-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-${colorClass}-200 transition-all duration-200 group-hover:scale-105`}>
                      <IconComponent className={`w-8 h-8 text-${colorClass}-600`} />
                    </div>
                    
                    {/* Category Name */}
                    <h3 className="text-sm font-medium text-gray-700 text-center leading-tight group-hover:text-blue-600 transition-colors max-w-20">
                      {category.name}
                    </h3>
                    
                    {/* Listing Count - Subtle */}
                    {category.listingCount !== undefined && (
                      <p className="text-xs text-gray-400 mt-1">
                        {category.listingCount}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Category Groups Summary */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Browse by Category Group</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
              {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => {
                const groupCategories = groupedCategories[groupKey as CategoryGroupKey] || [];
                const totalListings = groupCategories.reduce((sum, cat) => sum + (cat.listingCount || 0), 0);
                const GroupIcon = group.icon;
                const colorClass = getGroupColor(groupKey as CategoryGroupKey);

                return (
                  <div key={groupKey} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className={`p-4 bg-${colorClass}-100 rounded-xl w-fit mx-auto mb-4`}>
                      <GroupIcon className={`h-6 w-6 text-${colorClass}-600`} />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-xs text-gray-500">{totalListings} items</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {categories.length === 0 && !isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600">
                Categories are being set up. Please check back later.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}