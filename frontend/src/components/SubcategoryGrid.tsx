import { Link } from 'wouter';
import { getCategoryIcon } from '@/lib/categoryUtils';
import { getGroupColor, CATEGORY_GROUPS, type CategoryGroupKey } from '@/lib/categoryGroups';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SubcategoryGridProps {
  groupKey: CategoryGroupKey;
  currentCategorySlug?: string;
}

export function SubcategoryGrid({ groupKey, currentCategorySlug }: SubcategoryGridProps) {
  const group = CATEGORY_GROUPS[groupKey];
  const colorClass = getGroupColor(groupKey);

  const { data: categories, isLoading } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  // Filter categories to show only subcategories of this group
  const subcategories = categories?.filter(cat => 
    group.subcategories.includes(cat.slug as any)
  ) || [];

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Browse {group.name}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <CardContent className="p-0 text-center">
                <Skeleton className="w-12 h-12 rounded-lg mx-auto mb-3" />
                <Skeleton className="h-4 w-20 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Browse {group.name}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {subcategories.map((category) => {
          const IconComponent = getCategoryIcon(category.slug);
          const isActive = currentCategorySlug === category.slug;
          
          return (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                isActive ? `ring-2 ring-${colorClass}-500 bg-${colorClass}-50` : 'hover:bg-gray-50'
              }`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 bg-${colorClass}-100 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                    isActive ? `bg-${colorClass}-200` : `group-hover:bg-${colorClass}-200`
                  }`}>
                    <IconComponent className={`w-6 h-6 text-${colorClass}-600`} />
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {category.listingCount || 0} items
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}