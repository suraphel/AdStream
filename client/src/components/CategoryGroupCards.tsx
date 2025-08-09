import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORY_GROUPS, getGroupColor, type CategoryGroupKey } from '@/lib/categoryGroups';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryGroupCardsProps {
  onGroupClick?: (groupKey: CategoryGroupKey) => void;
}

export function CategoryGroupCards({ onGroupClick }: CategoryGroupCardsProps) {
  const { language } = useLanguage();

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600">
            Find exactly what you're looking for in organized categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => {
            const GroupIcon = group.icon;
            const colorClass = getGroupColor(groupKey as CategoryGroupKey);
            const groupName = language === 'am' ? group.nameAm : group.name;

            return (
              <Link key={groupKey} href={`/category-group/${groupKey}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-${colorClass}-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-${colorClass}-200 transition-colors`}>
                      <GroupIcon className={`w-8 h-8 text-${colorClass}-600`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {groupName}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                      Browse all {groupName.toLowerCase()} categories
                    </p>
                    
                    {/* Popular subcategories preview */}
                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {group.subcategories?.slice(0, 3).map((subcat, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {subcat}
                        </span>
                      ))}
                      {group.subcategories && group.subcategories.length > 3 && (
                        <span className="text-xs text-gray-500">+{group.subcategories.length - 3} more</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-10">
          <Link href="/categories">
            <button className="px-8 py-3 bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg font-medium shadow-sm">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}