import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_GROUPS, getCategoryGroup, getGroupColor, type CategoryGroupKey } from '@/lib/categoryGroups';

interface CategoryGroupBadgeProps {
  categorySlug: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function CategoryGroupBadge({ 
  categorySlug, 
  size = 'md', 
  showIcon = true 
}: CategoryGroupBadgeProps) {
  const groupKey = getCategoryGroup(categorySlug);
  
  if (!groupKey) return null;
  
  const group = CATEGORY_GROUPS[groupKey];
  const colorClass = getGroupColor(groupKey);
  const Icon = group.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };
  
  const colorVariants: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  
  return (
    <Badge 
      variant="outline"
      className={`
        ${sizeClasses[size]} 
        ${colorVariants[colorClass] || colorVariants.gray}
        flex items-center gap-1 font-medium
      `}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {group.name}
    </Badge>
  );
}