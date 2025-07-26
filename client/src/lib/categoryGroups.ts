// Category grouping system for enhanced organization
import { Car, Home, Smartphone, Shirt, Plane, Briefcase, Wrench } from 'lucide-react';

export const CATEGORY_GROUPS = {
  vehicles: {
    name: 'Vehicles',
    nameAm: 'ተሸከርካሪዎች',
    icon: Car,
    color: 'blue',
    subcategories: ['cars', 'motorcycles', 'bicycles', 'trailers', 'rental-cars']
  },
  property: {
    name: 'Property',
    nameAm: 'ንብረት',
    icon: Home,
    color: 'green',
    subcategories: ['real-estate-sale', 'real-estate-rent', 'land']
  },
  electronics: {
    name: 'Electronics',
    nameAm: 'ኤሌክትሮኒክስ',
    icon: Smartphone,
    color: 'purple',
    subcategories: ['smartphones', 'computers', 'tablets', 'electronics']
  },
  fashion: {
    name: 'Fashion & Clothing',
    nameAm: 'ፋሽን እና ልብስ',
    icon: Shirt,
    color: 'pink',
    subcategories: ['fashion-men', 'fashion-women', 'accessories']
  },
  travel: {
    name: 'Travel',
    nameAm: 'ጉዞ',
    icon: Plane,
    color: 'indigo',
    subcategories: ['airline-tickets', 'hotels', 'car-rental']
  },
  jobs: {
    name: 'Jobs',
    nameAm: 'ስራዎች',
    icon: Briefcase,
    color: 'orange',
    subcategories: ['full-time', 'part-time', 'freelance', 'internships']
  },
  services: {
    name: 'Services',
    nameAm: 'አገልግሎቶች',
    icon: Wrench,
    color: 'gray',
    subcategories: ['home-services', 'professional', 'education', 'health']
  }
} as const;

export type CategoryGroupKey = keyof typeof CATEGORY_GROUPS;

export function getCategoryGroup(categorySlug: string): CategoryGroupKey | null {
  for (const [groupKey, group] of Object.entries(CATEGORY_GROUPS)) {
    if (group.subcategories.includes(categorySlug as any)) {
      return groupKey as CategoryGroupKey;
    }
  }
  return null;
}

export function getGroupColor(groupKey: CategoryGroupKey): string {
  return CATEGORY_GROUPS[groupKey].color;
}

export function isVehicleCategory(categorySlug: string): boolean {
  return CATEGORY_GROUPS.vehicles.subcategories.includes(categorySlug as any);
}

export function isElectronicsCategory(categorySlug: string): boolean {
  return CATEGORY_GROUPS.electronics.subcategories.includes(categorySlug as any);
}

export const VEHICLE_GEARBOX_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'cvt', label: 'CVT' },
  { value: 'semi-automatic', label: 'Semi-Automatic' }
];

export const VEHICLE_FUEL_OPTIONS = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'lpg', label: 'LPG' }
];

export const ELECTRONICS_STORAGE_OPTIONS = [
  { value: 'ssd', label: 'SSD' },
  { value: 'hdd', label: 'HDD' },
  { value: 'hybrid', label: 'Hybrid (SSD + HDD)' }
];