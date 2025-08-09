import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, X, MapPin } from 'lucide-react';

interface FilterState {
  priceRange: [number, number];
  condition: string[];
  location: string;
  brands: string[];
  transmission: string;
  mileage: [number, number];
  searchTerm: string;
}

interface CategoryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categorySlug?: string;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function CategoryFilters({ 
  filters, 
  onFiltersChange, 
  categorySlug = '',
  className = '',
  isOpen = true,
  onToggle
}: CategoryFiltersProps) {
  const locations = [
    { value: 'all', label: 'All Ethiopia' },
    { value: 'addis-ababa', label: 'Addis Ababa' },
    { value: 'dire-dawa', label: 'Dire Dawa' },
    { value: 'bahir-dar', label: 'Bahir Dar' },
    { value: 'gondar', label: 'Gondar' },
    { value: 'hawassa', label: 'Hawassa' },
    { value: 'mekelle', label: 'Mekelle' },
    { value: 'jimma', label: 'Jimma' },
    { value: 'adama', label: 'Adama' },
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
    { value: 'refurbished', label: 'Refurbished' },
  ];

  const brands = categorySlug === 'vehicles' 
    ? ['Toyota', 'Hyundai', 'Nissan', 'Honda', 'Suzuki', 'Mitsubishi', 'Isuzu']
    : categorySlug === 'electronics'
    ? ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'LG', 'Sony', 'Dell']
    : ['Brand A', 'Brand B', 'Brand C'];

  const updateFilters = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
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

  if (!isOpen) {
    return (
      <div className={`${className} lg:hidden`}>
        <Button 
          variant="outline" 
          onClick={onToggle}
          className="w-full flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Show Filters
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">Search</Label>
          <div className="relative">
            <Input
              placeholder="Search listings..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters('searchTerm', e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Select value={filters.location} onValueChange={(value) => updateFilters('location', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location.value} value={location.value}>
                  {location.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">Price Range (ETB)</Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilters('priceRange', value as [number, number])}
            max={1000000}
            min={0}
            step={10000}
            className="mb-2"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{filters.priceRange[0].toLocaleString()} ETB</span>
            <span>{filters.priceRange[1].toLocaleString()} ETB</span>
          </div>
        </CardContent>
      </Card>

      {/* Condition */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">Condition</Label>
          <div className="space-y-2">
            {conditions.map(condition => (
              <div key={condition.value} className="flex items-center space-x-2">
                <Checkbox
                  id={condition.value}
                  checked={filters.condition.includes(condition.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters('condition', [...filters.condition, condition.value]);
                    } else {
                      updateFilters('condition', filters.condition.filter(c => c !== condition.value));
                    }
                  }}
                />
                <Label htmlFor={condition.value} className="text-sm">
                  {condition.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm font-medium mb-2 block">Brands</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={brand}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFilters('brands', [...filters.brands, brand]);
                    } else {
                      updateFilters('brands', filters.brands.filter(b => b !== brand));
                    }
                  }}
                />
                <Label htmlFor={brand} className="text-sm">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle-specific filters */}
      {categorySlug === 'vehicles' && (
        <>
          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Transmission</Label>
              <Select 
                value={filters.transmission} 
                onValueChange={(value) => updateFilters('transmission', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Label className="text-sm font-medium mb-2 block">Mileage (km)</Label>
              <Slider
                value={filters.mileage}
                onValueChange={(value) => updateFilters('mileage', value as [number, number])}
                max={200000}
                min={0}
                step={5000}
                className="mb-2"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{filters.mileage[0].toLocaleString()} km</span>
                <span>{filters.mileage[1].toLocaleString()} km</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Clear Filters */}
      <Button 
        variant="outline" 
        onClick={clearFilters}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  );
}