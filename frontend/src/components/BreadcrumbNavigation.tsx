import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { getCategoryGroup, CATEGORY_GROUPS } from '@/lib/categoryGroups';
import { useLanguage } from '@/contexts/LanguageContext';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbNavigationProps {
  categorySlug?: string;
  subcategorySlug?: string;
  categoryName?: string;
  subcategoryName?: string;
}

export function BreadcrumbNavigation({ 
  categorySlug, 
  subcategorySlug, 
  categoryName, 
  subcategoryName 
}: BreadcrumbNavigationProps) {
  const { t } = useLanguage();
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: t('nav.home'), href: '/' }
  ];

  // Add main category group if we have a category
  if (categorySlug) {
    const groupKey = getCategoryGroup(categorySlug);
    if (groupKey) {
      const group = CATEGORY_GROUPS[groupKey];
      breadcrumbs.push({
        label: group.name,
        href: `/category-group/${groupKey}`
      });
    }
  }

  // Add specific category if we have one
  if (categorySlug && categoryName) {
    breadcrumbs.push({
      label: categoryName,
      href: `/category/${categorySlug}`
    });
  }

  // Add subcategory if we have one
  if (subcategorySlug && subcategoryName) {
    breadcrumbs.push({
      label: subcategoryName,
      href: `/category/${categorySlug}/${subcategorySlug}`
    });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index === 0 && <Home className="w-4 h-4 mr-1" />}
            {index < breadcrumbs.length - 1 ? (
              <Link href={item.href}>
                <span className="hover:text-blue-600 transition-colors cursor-pointer">
                  {item.label}
                </span>
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{item.label}</span>
            )}
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}