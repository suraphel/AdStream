import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Zap, Star, TrendingUp, Eye, Clock, CheckCircle } from 'lucide-react';

interface BoostListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  listingTitle: string;
}

const BOOST_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic Boost',
    price: 50,
    duration: '3 days',
    features: [
      'Featured in search results',
      '3x more visibility',
      'Highlighted border',
      'Top category placement'
    ],
    icon: Star,
    color: 'blue',
    description: 'Get your listing noticed with basic promotion'
  },
  {
    id: 'premium',
    name: 'Premium Boost',
    price: 120,
    duration: '7 days',
    features: [
      'Homepage featured section',
      '5x more visibility',
      'Premium badge display',
      'Top search results',
      'Social media promotion',
      'Email newsletter inclusion'
    ],
    icon: TrendingUp,
    color: 'purple',
    description: 'Maximum exposure for your listing',
    popular: true
  },
  {
    id: 'express',
    name: 'Express Boost',
    price: 25,
    duration: '24 hours',
    features: [
      'Urgent listing badge',
      '2x visibility boost',
      'Priority placement'
    ],
    icon: Zap,
    color: 'orange',
    description: 'Quick visibility boost for urgent sales'
  }
];

export function BoostListingModal({ open, onOpenChange, listingId, listingTitle }: BoostListingModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const boostMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const packageData = BOOST_PACKAGES.find(p => p.id === packageId);
      return await apiRequest('POST', '/api/listings/boost', {
        listingId,
        packageId,
        amount: packageData?.price
      });
    },
    onSuccess: () => {
      toast({
        title: "Listing Boosted Successfully!",
        description: "Your listing is now promoted and will receive increased visibility.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-listings'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Boost Failed",
        description: error.message || "Failed to boost listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBoost = () => {
    if (!selectedPackage) return;
    boostMutation.mutate(selectedPackage);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Boost Your Listing
          </DialogTitle>
          <DialogDescription>
            Increase visibility and get more views for "{listingTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {BOOST_PACKAGES.map((pkg) => {
            const IconComponent = pkg.icon;
            const isSelected = selectedPackage === pkg.id;
            
            return (
              <Card 
                key={pkg.id}
                className={`cursor-pointer transition-all relative ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                } ${pkg.popular ? 'border-primary' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-3">
                  <div className={`w-12 h-12 mx-auto rounded-full bg-${pkg.color}-100 flex items-center justify-center mb-2`}>
                    <IconComponent className={`h-6 w-6 text-${pkg.color}-600`} />
                  </div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold">{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">ETB</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.duration}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    {pkg.description}
                  </p>
                  
                  <div className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <Separator />

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Boost Benefits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Increased visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span>Premium placement</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Faster sales</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBoost}
            disabled={!selectedPackage || boostMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {boostMutation.isPending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Boost Listing
                {selectedPackage && (
                  <span className="ml-1">
                    ({BOOST_PACKAGES.find(p => p.id === selectedPackage)?.price} ETB)
                  </span>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}