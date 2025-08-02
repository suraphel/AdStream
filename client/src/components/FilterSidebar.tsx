import { useState, useEffect } from 'react';

// Debounce hook for optimized API calls
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X,
  MapPin,
  DollarSign,
  Settings,
  Car,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCategoryGroup } from '@/lib/categoryGroups';

export interface FilterState {
  priceRange: [number, number];
  condition: string[];
  location: string;
  brands: string[];
  transmission?: string;
  mileage?: [number, number];
  searchTerm: string;
  [key: string]: any;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categorySlug?: string;
  className?: string;
}

const ETHIOPIAN_CITIES = [
  { value: 'all', label: 'All Ethiopia' },
  { value: 'addis-ababa', label: 'Addis Ababa' },
  { value: 'dire-dawa', label: 'Dire Dawa' },
  { value: 'mekelle', label: 'Mekelle' },
  { value: 'bahir-dar', label: 'Bahir Dar' },
  { value: 'hawassa', label: 'Hawassa' },
  { value: 'gondar', label: 'Gondar' },
  { value: 'dessie', label: 'Dessie' },
  { value: 'jimma', label: 'Jimma' },
  { value: 'jijiga', label: 'Jijiga' },
  { value: 'shashamene', label: 'Shashamene' }
];

const CAR_BRANDS = [
  'Toyota', 'Hyundai', 'Mercedes-Benz', 'BMW', 'Nissan', 'Mitsubishi', 
  'Kia', 'Ford', 'Honda', 'Suzuki', 'Volkswagen', 'Peugeot', 'Renault'
];

const PHONE_BRANDS = [
  'Samsung', 'Apple', 'Huawei', 'Xiaomi', 'Oppo', 'Vivo', 'OnePlus', 
  'Nokia', 'Realme', 'Tecno', 'Infinix', 'Itel'
];

const LAPTOP_BRANDS = [
  'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'MSI', 'Toshiba', 
  'Sony', 'Samsung', 'LG'
];

export function FilterSidebar({ 
  isOpen, 
  onToggle, 
  filters, 
  onFiltersChange, 
  categorySlug,
  className = ''
}: FilterSidebarProps) {
  const { t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    condition: true,
    location: true,
    brands: true,
    specifications: true
  });

  const categoryGroup = categorySlug ? getCategoryGroup(categorySlug) : null;
  const isVehicleCategory = categoryGroup === 'vehicles';
  const isElectronicsCategory = categoryGroup === 'electronics';

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Debounced filter updates for price and mileage sliders
  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);
  const [localMileage, setLocalMileage] = useState(filters.mileage || [0, 200000]);
  const debouncedPriceRange = useDebounce(localPriceRange, 800);
  const debouncedMileage = useDebounce(localMileage, 800);

  // Apply debounced updates
  useEffect(() => {
    if (debouncedPriceRange !== filters.priceRange) {
      updateFilters({ priceRange: debouncedPriceRange });
    }
  }, [debouncedPriceRange]);

  useEffect(() => {
    if (debouncedMileage !== filters.mileage) {
      updateFilters({ mileage: debouncedMileage });
    }
  }, [debouncedMileage]);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleBrandToggle = (brand: string) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    updateFilters({ brands: newBrands });
  };

  const handleSelectAllBrands = () => {
    let allBrands: string[] = [];
    if (isVehicleCategory) allBrands = CAR_BRANDS;
    else if (isElectronicsCategory) {
      if (categorySlug?.includes('smartphone') || categorySlug?.includes('phone')) {
        allBrands = PHONE_BRANDS;
      } else if (categorySlug?.includes('laptop') || categorySlug?.includes('computer')) {
        allBrands = LAPTOP_BRANDS;
      } else {
        allBrands = [...PHONE_BRANDS, ...LAPTOP_BRANDS];
      }
    }
    
    const currentBrands = filters.brands || [];
    const allSelected = allBrands.every(brand => currentBrands.includes(brand));
    updateFilters({ brands: allSelected ? [] : allBrands });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000000],
      condition: [],
      location: 'all',
      brands: [],
      transmission: 'any',
      mileage: [0, 200000],
      searchTerm: ''
    });
  };

  const getBrandsList = () => {
    if (isVehicleCategory) return CAR_BRANDS;
    if (isElectronicsCategory) {
      if (categorySlug?.includes('smartphone') || categorySlug?.includes('phone')) {
        return PHONE_BRANDS;
      } else if (categorySlug?.includes('laptop') || categorySlug?.includes('computer')) {
        return LAPTOP_BRANDS;
      }
      return [...PHONE_BRANDS, ...LAPTOP_BRANDS];
    }
    return [];
  };

  const getBrandLabel = () => {
    if (isVehicleCategory) return 'Car Brands';
    if (isElectronicsCategory) return 'Brands';
    return 'Brands';
  };

  return (
    <div className={`transition-all duration-300 ${className}`}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        onClick={onToggle}
        className="mb-4 w-full lg:w-auto"
      >
        <Filter className="w-4 h-4 mr-2" />
        {isOpen ? 'Hide Filters' : 'Show Filters'}
      </Button>

      {/* Filter Panel */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
      }`}>
        <Card className="w-full lg:w-80">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <Input
                id="search"
                placeholder="Search listings..."
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Price Range */}
            <Collapsible open={expandedSections.price} onOpenChange={() => toggleSection('price')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="font-medium">Price Range (ETB)</span>
                  </div>
                  {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <Slider
                  value={localPriceRange}
                  onValueChange={(value) => setLocalPriceRange(value as [number, number])}
                  max={1000000}
                  step={5000}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>ETB {localPriceRange[0].toLocaleString()}</span>
                  <span>ETB {localPriceRange[1].toLocaleString()}</span>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Condition */}
            <Collapsible open={expandedSections.condition} onOpenChange={() => toggleSection('condition')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                  <span className="font-medium">Condition</span>
                  {expandedSections.condition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-3">
                {['New', 'Used', 'Refurbished'].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={filters.condition.includes(condition)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilters({ condition: [...filters.condition, condition] });
                        } else {
                          updateFilters({ condition: filters.condition.filter(c => c !== condition) });
                        }
                      }}
                    />
                    <Label htmlFor={condition} className="text-sm">{condition}</Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Location */}
            <Collapsible open={expandedSections.location} onOpenChange={() => toggleSection('location')}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="font-medium">Location</span>
                  </div>
                  {expandedSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {ETHIOPIAN_CITIES.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CollapsibleContent>
            </Collapsible>

            {/* Brands */}
            {getBrandsList().length > 0 && (
              <Collapsible open={expandedSections.brands} onOpenChange={() => toggleSection('brands')}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                    <div className="flex items-center">
                      {isVehicleCategory ? <Car className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                      <span className="font-medium">{getBrandLabel()}</span>
                    </div>
                    {expandedSections.brands ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllBrands}
                    className="w-full text-xs"
                  >
                    {getBrandsList().every(brand => filters.brands?.includes(brand)) ? 'Deselect All' : 'Select All'}
                  </Button>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {getBrandsList().map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={filters.brands?.includes(brand) || false}
                          onCheckedChange={() => handleBrandToggle(brand)}
                        />
                        <Label htmlFor={brand} className="text-sm">{brand}</Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Vehicle-specific filters */}
            {isVehicleCategory && (
              <Collapsible open={expandedSections.specifications} onOpenChange={() => toggleSection('specifications')}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
                    <span className="font-medium">Specifications</span>
                    {expandedSections.specifications ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  {/* Transmission */}
                  <div>
                    <Label className="text-sm font-medium">Transmission</Label>
                    <Select value={filters.transmission || 'any'} onValueChange={(value) => updateFilters({ transmission: value === 'any' ? '' : value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Any transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any transmission</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mileage */}
                  <div>
                    <Label className="text-sm font-medium">Mileage (km)</Label>
                    <Slider
                      value={localMileage}
                      onValueChange={(value) => setLocalMileage(value as [number, number])}
                      max={500000}
                      step={5000}
                      className="w-full mt-2"
                    />
                    <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                      <span>{localMileage[0].toLocaleString()} km</span>
                      <span>{localMileage[1].toLocaleString()} km</span>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}