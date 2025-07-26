import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { insertListingSchema } from '@shared/schema';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, X } from 'lucide-react';
import type { z } from 'zod';

type EditListingFormData = z.infer<typeof insertListingSchema>;

export default function EditListing() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const listingId = parseInt(params.id as string);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch listing data
  const { data: listing, isLoading: listingLoading, error } = useQuery({
    queryKey: ['/api/listings', listingId],
    enabled: isAuthenticated && !isNaN(listingId),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    enabled: isAuthenticated,
  });

  const form = useForm<EditListingFormData>({
    resolver: zodResolver(insertListingSchema.omit({ userId: true })),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      currency: 'ETB',
      location: '',
      categoryId: 85,
      condition: 'new',
    },
  });

  // Update form values when listing data is loaded
  useEffect(() => {
    if (listing) {
      form.reset({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        currency: listing.currency,
        location: listing.location,
        categoryId: listing.categoryId,
        condition: listing.condition,
      });
    }
  }, [listing, form]);

  const updateListingMutation = useMutation({
    mutationFn: async (data: EditListingFormData) => {
      await apiRequest('PUT', `/api/listings/${listingId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings', listingId] });
      toast({
        title: "Success",
        description: "Listing updated successfully!",
      });
      setLocation('/my-ads');
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditListingFormData) => {
    updateListingMutation.mutate(data);
  };

  if (isLoading || listingLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Listing not found
              </h3>
              <p className="text-gray-600 mb-6">
                The listing you're trying to edit doesn't exist or you don't have permission to edit it.
              </p>
              <Button onClick={() => setLocation('/my-ads')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Listings
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const translations = {
    en: {
      editListing: 'Edit Listing',
      title: 'Title',
      description: 'Description',
      price: 'Price',
      currency: 'Currency',
      location: 'Location',
      category: 'Category',
      condition: 'Condition',
      new: 'New',
      used: 'Used',
      refurbished: 'Refurbished',
      save: 'Save Changes',
      cancel: 'Cancel',
      saving: 'Saving...',
      selectCategory: 'Select a category',
    },
    am: {
      editListing: 'ዕቃ አርም',
      title: 'ርዕስ',
      description: 'መግለጫ',
      price: 'ዋጋ',
      currency: 'ገንዘብ',
      location: 'አካባቢ',
      category: 'ምድብ',
      condition: 'ሁኔታ',
      new: 'አዲስ',
      used: 'ጥቅም ላይ የዋለ',
      refurbished: 'የተሻሻለ',
      save: 'ለውጦችን አስቀምጥ',
      cancel: 'ይቅር',
      saving: 'እየተቀመጠ...',
      selectCategory: 'ምድብ ይምረጡ',
    },
  };

  const tr = translations[language];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{tr.editListing}</h1>
          <Button
            variant="outline"
            onClick={() => setLocation('/my-ads')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tr.cancel}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{tr.editListing}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.title}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter listing title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.description}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your item..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tr.price}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tr.currency}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ETB">ETB (Ethiopian Birr)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.location}</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.category}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={tr.selectCategory} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {language === 'am' ? category.nameAm : category.name}
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
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tr.condition}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">{tr.new}</SelectItem>
                          <SelectItem value="used">{tr.used}</SelectItem>
                          <SelectItem value="refurbished">{tr.refurbished}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={updateListingMutation.isPending}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateListingMutation.isPending ? tr.saving : tr.save}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation('/my-ads')}
                    disabled={updateListingMutation.isPending}
                  >
                    {tr.cancel}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}