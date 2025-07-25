import { useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { requiresAuthForContact, getAuthRequiredMessage } from '@/lib/categoryUtils';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  MapPin, 
  Eye, 
  Phone, 
  Mail, 
  User, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Lock
} from 'lucide-react';
import { formatRelativeTime, formatPrice } from '@/lib/i18n';
import { useState } from 'react';

export default function ListingDetail() {
  const params = useParams();
  const id = params.id;
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });

  const contactSellerMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/conversations', 'POST', {
        otherUserId: listing?.userId,
        listingId: listing?.id,
        initialMessage: message,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Message sent!",
        description: "Your message has been sent to the seller.",
      });
      // Redirect to messages page with the conversation
      window.location.href = '/messages';
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (listing?.isFavorited) {
        await apiRequest('DELETE', `/api/favorites/${listing.id}`);
      } else {
        await apiRequest('POST', '/api/favorites', { listingId: listing?.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
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
        description: "Failed to update favorite",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    favoriteMutation.mutate();
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    const defaultMessage = `Hi! I'm interested in your listing "${listing?.title}". Is it still available?`;
    contactSellerMutation.mutate(defaultMessage);
  };

  const nextImage = () => {
    if (listing?.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="w-full h-96 rounded-lg mb-4" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Listing not found
              </h1>
              <p className="text-gray-600 mb-4">
                The listing you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <a href="/">Go back home</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentImage = listing.images[currentImageIndex];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-6">
              {currentImage ? (
                <div className="relative">
                  <img
                    src={currentImage.imageUrl}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {listing.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              
              {/* Image Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listing Details */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {listing.isFeatured && (
                      <Badge className="bg-yellow-500 text-white">
                        {t('listings.featured')}
                      </Badge>
                    )}
                    <Badge variant="outline">{listing.category.name}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>
                  <p className="text-4xl font-bold text-primary mb-4">
                    {formatPrice(Number(listing.price), listing.currency, language)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFavoriteClick}
                  disabled={favoriteMutation.isPending}
                  className="shrink-0"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      listing.isFavorited ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatRelativeTime(listing.createdAt!, language)}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{listing.viewCount} views</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>

              {listing.condition && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Condition</h2>
                  <Badge variant="secondary" className="capitalize">
                    {listing.condition}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={listing.user.profileImageUrl} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {listing.user.firstName || listing.user.lastName
                        ? `${listing.user.firstName || ''} ${listing.user.lastName || ''}`.trim()
                        : 'User'
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      Member since {new Date(listing.user.createdAt!).getFullYear()}
                    </p>
                  </div>
                </div>

                {user?.id !== listing.user.id && (
                  /* Contact Section - Authentication Required for P2P Categories */
                  requiresAuthForContact(listing.category.slug) && !isAuthenticated ? (
                    <div className="space-y-3">
                      {/* Restricted Access Message */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Sign in to contact seller
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {getAuthRequiredMessage(listing.category.slug, language)}
                        </p>
                      </div>

                      {/* Show Contact Info Button */}
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => window.location.href = '/api/login'}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Show Contact Info
                      </Button>
                      
                      {/* Start Chat Button */}
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.location.href = '/api/login'}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Chat
                      </Button>
                    </div>
                  ) : (
                    /* Full Access - User is authenticated or category is public */
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                        onClick={handleContactSeller}
                        disabled={contactSellerMutation.isPending}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {contactSellerMutation.isPending ? 'Sending...' : 'Contact Seller'}
                      </Button>
                      {listing.user.phone && (
                        <Button className="w-full" variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          {listing.user.phone}
                        </Button>
                      )}
                      {listing.user.email && (
                        <Button className="w-full" variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          {listing.user.email}
                        </Button>
                      )}
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Safety Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Meet in a public place</li>
                  <li>• Check the item before payment</li>
                  <li>• Never send money in advance</li>
                  <li>• Trust your instincts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
