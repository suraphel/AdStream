import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader, UploadedImage } from '@/components/ImageUploader';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().min(1, 'Price is required'),
  currency: z.string().default('ETB'),
  categoryId: z.string().min(1, 'Category is required'),
  location: z.string().min(2, 'Location is required'),
  condition: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface Category {
  id: number;
  name: string;
  nameAm?: string;
  slug: string;
}

const PostListing: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const translations = {
    en: {
      title: 'Post New Listing',
      backToHome: 'Back to Home',
      listingTitle: 'Title',
      listingTitlePlaceholder: 'Enter listing title',
      description: 'Description',
      descriptionPlaceholder: 'Describe your item in detail',
      price: 'Price',
      pricePlaceholder: 'Enter price',
      currency: 'Currency',
      category: 'Category',
      categoryPlaceholder: 'Select a category',
      location: 'Location',
      locationPlaceholder: 'Enter your location',
      condition: 'Condition',
      conditionPlaceholder: 'Select condition',
      images: 'Images',
      imagesDescription: 'Upload up to 10 images of your item',
      postListing: 'Post Listing',
      posting: 'Posting...',
      cancel: 'Cancel',
      success: 'Listing posted successfully!',
      error: 'Failed to post listing',
      conditionNew: 'New',
      conditionUsed: 'Used',
      conditionRefurbished: 'Refurbished',
      toggleLanguage: 'Switch to Amharic'
    },
    am: {
      title: 'አዲስ ዕቃ ለሽያጭ ያስቀምጡ',
      backToHome: 'ወደ ቤት ተመለስ',
      listingTitle: 'ርዕስ',
      listingTitlePlaceholder: 'የዕቃው ርዕስ ያስገቡ',
      description: 'መግለጫ',
      descriptionPlaceholder: 'የዕቃውን ዝርዝር መግለጫ ያስገቡ',
      price: 'ዋጋ',
      pricePlaceholder: 'ዋጋ ያስገቡ',
      currency: 'ምንዛሬ',
      category: 'ምድብ',
      categoryPlaceholder: 'ምድብ ይምረጡ',
      location: 'አድራሻ',
      locationPlaceholder: 'የእርስዎን አድራሻ ያስገቡ',
      condition: 'ሁኔታ',
      conditionPlaceholder: 'ሁኔታ ይምረጡ',
      images: 'ምስሎች',
      imagesDescription: 'እስከ 10 ምስሎች ያስቀምጡ',
      postListing: 'ዕቃ ለሽያጭ አስቀምጥ',
      posting: 'እየተለጠፈ...',
      cancel: 'ይቅር',
      success: 'ዕቃ በተሳካ ሁኔታ ተለጠፈ!',
      error: 'ዕቃ መለጠፍ አልተሳካም',
      conditionNew: 'አዲስ',
      conditionUsed: 'ተጠቅሟል',
      conditionRefurbished: 'ታድሷል',
      toggleLanguage: 'ወደ እንግሊዝኛ ቀይር'
    }
  };

  const t = translations[language];

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      currency: 'ETB',
      categoryId: '',
      location: '',
      condition: '',
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingFormData & { imageKeys: string[] }) => {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          categoryId: parseInt(data.categoryId),
          price: parseFloat(data.price),
          images: data.imageKeys,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create listing');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t.success,
        description: language === 'am' ? 'ዕቃዎ በተሳካ ሁኔታ ተለጠፈ' : 'Your listing has been posted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: t.error,
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ListingFormData) => {
    const imageKeys = images.map(img => img.key);
    createListingMutation.mutate({ ...data, imageKeys });
  };

  const handleImagesChange = (uploadedImages: UploadedImage[]) => {
    setImages(uploadedImages);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToHome}
          </Button>
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
        >
          {t.toggleLanguage}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.listingTitle}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t.listingTitlePlaceholder} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.description}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t.descriptionPlaceholder} 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.price}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder={t.pricePlaceholder} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.currency}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ETB">ETB</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Category and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.category}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.categoryPlaceholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {language === 'am' && category.nameAm ? category.nameAm : category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.location}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t.locationPlaceholder} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Condition */}
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.condition}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.conditionPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">{t.conditionNew}</SelectItem>
                        <SelectItem value="used">{t.conditionUsed}</SelectItem>
                        <SelectItem value="refurbished">{t.conditionRefurbished}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Images */}
              <div className="space-y-2">
                <FormLabel>{t.images}</FormLabel>
                <p className="text-sm text-muted-foreground">{t.imagesDescription}</p>
                <ImageUploader
                  onImagesChange={handleImagesChange}
                  initialImages={images}
                  maxImages={10}
                  language={language}
                  className="mt-2"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={createListingMutation.isPending}
                >
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={createListingMutation.isPending}
                  className="flex-1"
                >
                  {createListingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t.posting}
                    </>
                  ) : (
                    t.postListing
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostListing;