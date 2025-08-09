import { Control, useWatch } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ELECTRONICS_STORAGE_OPTIONS, isElectronicsCategory } from '@/lib/categoryGroups';

interface ElectronicsFieldsProps {
  control: Control<any>;
  categorySlug?: string;
}

export function ElectronicsFields({ control, categorySlug }: ElectronicsFieldsProps) {
  const watchedCategory = useWatch({ control, name: 'categoryId' });
  
  // Don't render if not an electronics category
  if (categorySlug && !isElectronicsCategory(categorySlug)) {
    return null;
  }
  
  if (!categorySlug && !isElectronicsCategory(watchedCategory)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="cpu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPU/Processor</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Intel Core i7-12700H"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="ram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RAM</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 16GB DDR4"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="gpu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Graphics Card</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., NVIDIA RTX 4060"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="motherboard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motherboard</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., ASUS ROG Strix B550"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="storageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select storage type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ELECTRONICS_STORAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="storageSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Size</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 1TB NVMe SSD"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}