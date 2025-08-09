import { useState } from 'react';
// Removed useQuery - standalone operation
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchHeroProps {
  onSearch?: (params: {
    search: string;
    category: string;
    location: string;
  }) => void;
}

export function SearchHero({ onSearch }: SearchHeroProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  // Mock categories for standalone operation
  const categories: any[] = [];

  const locations = [
    { value: 'all', label: t('search.allEthiopia') },
    { value: 'addis-ababa', label: t('cities.addisAbaba') },
    { value: 'dire-dawa', label: t('cities.direDawa') },
    { value: 'bahir-dar', label: t('cities.bahirDar') },
    { value: 'gondar', label: t('cities.gondar') },
    { value: 'hawassa', label: t('cities.hawassa') },
    { value: 'mekelle', label: t('cities.mekelle') },
    { value: 'jimma', label: t('cities.jimma') },
    { value: 'adama', label: t('cities.adama') },
    { value: 'dessie', label: t('cities.dessie') },
    { value: 'debre-markos', label: t('cities.debreMarkos') },
  ];

  const handleSearch = () => {
    onSearch?.({ search, category, location });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-secondary-800 mb-2">
            {t('search.title')}
          </h2>
          <p className="text-secondary-600">
            {t('search.subtitle')}
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-600 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('search.allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('search.allCategories')}</SelectItem>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Select */}
              <div>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('search.allEthiopia')} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="ghost" className="text-primary">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {t('search.advancedFilters')}
              </Button>
              <Button onClick={handleSearch} className="bg-primary text-white hover:bg-primary/90">
                <Search className="w-4 h-4 mr-2" />
                {t('search.searchButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
