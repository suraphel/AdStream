import { useState } from 'react';
import { Link } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin } from 'lucide-react';
import { formatRelativeTime, formatPrice } from '@/lib/i18n';
import type { ListingWithDetails } from '@shared/schema';

interface ListingCardProps {
  listing: ListingWithDetails;
  featured?: boolean;
}

export function ListingCard({ listing, featured = false }: ListingCardProps) {
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(listing.isFavorited);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest('DELETE', `/api/favorites/${listing.id}`);
      } else {
        await apiRequest('POST', '/api/favorites', { listingId: listing.id });
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    
    favoriteMutation.mutate();
  };

  const primaryImage = listing.images?.find(img => img.isPrimary) || listing.images?.[0];
  const imageUrl = primaryImage?.imageUrl || '/uploads/listings/placeholder.svg';

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow group ${
      featured ? 'ring-2 ring-blue-500' : ''
    }`}>
      {featured && (
        <Badge className="absolute top-3 left-3 z-10 bg-yellow-500 text-white">
          {t('listings.featured')}
        </Badge>
      )}
      
      <Link href={`/listing/${listing.id}`}>
        <div className="relative">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/uploads/listings/placeholder.svg';
            }}
          />
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 bg-white/80 hover:bg-white transition-all"
              onClick={handleFavoriteClick}
              disabled={favoriteMutation.isPending}
            >
              <Heart 
                className={`w-4 h-4 ${
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`} 
              />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium text-secondary-800 mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {listing.title}
          </h3>
          <p className={`font-bold text-secondary-800 mb-2 ${featured ? 'text-2xl' : 'text-xl'}`}>
            {formatPrice(Number(listing.price), listing.currency, language)}
          </p>
          <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
            {listing.description}
          </p>
          <div className="flex items-center justify-between text-xs text-secondary-600">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{listing.location}</span>
            </div>
            <span>{formatRelativeTime(listing.createdAt!, language)}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
