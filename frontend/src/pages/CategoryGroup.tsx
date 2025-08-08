import { useParams } from 'wouter';
import { Layout } from '@/components/Layout';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { SubcategoryGrid } from '@/components/SubcategoryGrid';
import { CATEGORY_GROUPS, type CategoryGroupKey } from '@/lib/categoryGroups';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CategoryGroup() {
  const params = useParams();
  const { language } = useLanguage();
  const groupKey = params.groupKey as CategoryGroupKey;
  
  const group = CATEGORY_GROUPS[groupKey];
  
  if (!group) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Category group not found
                </h1>
                <p className="text-gray-600 mb-4">
                  The category group you're looking for doesn't exist.
                </p>
                <a 
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Back to Home
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const IconComponent = group.icon;
  const groupName = language === 'am' ? group.nameAm : group.name;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <BreadcrumbNavigation />

          {/* Group Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className={`p-4 bg-${group.color}-100 rounded-xl mr-4`}>
                <IconComponent className={`w-8 h-8 text-${group.color}-600`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {groupName}
                </h1>
                <p className="text-lg text-gray-600">
                  Browse all {groupName.toLowerCase()} subcategories
                </p>
              </div>
            </div>
          </div>

          {/* Subcategories Grid */}
          <SubcategoryGrid 
            groupKey={groupKey}
          />
        </div>
      </div>
    </Layout>
  );
}