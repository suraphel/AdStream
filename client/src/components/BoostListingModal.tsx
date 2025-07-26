import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, TrendingUp, Star, Clock } from 'lucide-react';

interface BoostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  listingTitle: string;
}

const BOOST_PLANS = [
  {
    level: 1,
    name: 'Basic Boost',
    price: 50,
    duration: 7,
    features: [
      'Show in featured section for 7 days',
      '2x more visibility in search results',
      'Priority in category listings',
      'Boost badge on listing'
    ],
    color: 'blue',
    recommended: false
  },
  {
    level: 2,
    name: 'Premium Boost',
    price: 120,
    duration: 14,
    features: [
      'Show in featured section for 14 days',
      '5x more visibility in search results',
      'Top position in category listings',
      'Premium boost badge',
      'Email notifications on views',
      'Priority customer support'
    ],
    color: 'purple',
    recommended: true
  },
  {
    level: 3,
    name: 'Ultimate Boost',
    price: 200,
    duration: 30,
    features: [
      'Show in featured section for 30 days',
      '10x more visibility in search results',
      'Homepage featured placement',
      'Ultimate boost badge',
      'Email notifications on views',
      'Priority customer support',
      'Social media promotion',
      'WhatsApp marketing reach'
    ],
    color: 'orange',
    recommended: false
  }
];

export function BoostListingModal({ isOpen, onClose, listingId, listingTitle }: BoostListingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const boostMutation = useMutation({
    mutationFn: async (planLevel: number) => {
      const plan = BOOST_PLANS.find(p => p.level === planLevel);
      if (!plan) throw new Error('Invalid plan selected');

      // Create boost purchase with Stripe payment intent
      const response = await apiRequest('POST', '/api/boost/purchase', {
        listingId,
        boostLevel: plan.level,
        duration: plan.duration,
        amount: plan.price
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Boost Activated!",
          description: "Your listing boost has been activated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: [`/api/listings/${listingId}`] });
        onClose();
      }
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
        description: "Failed to create boost. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBoost = () => {
    if (selectedPlan) {
      boostMutation.mutate(selectedPlan);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Boost Your Listing</span>
          </DialogTitle>
          <DialogDescription>
            Increase visibility and get more potential buyers for "{listingTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Boost Your Listing?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">More Views</p>
                  <p className="text-sm text-gray-600">Up to 10x visibility</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">Featured Placement</p>
                  <p className="text-sm text-gray-600">Top of search results</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Faster Sales</p>
                  <p className="text-sm text-gray-600">Sell 3x faster</p>
                </div>
              </div>
            </div>
          </div>

          {/* Boost Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BOOST_PLANS.map((plan) => (
              <Card
                key={plan.level}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPlan === plan.level
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:shadow-lg border-gray-200'
                } ${plan.recommended ? 'ring-2 ring-purple-500 border-purple-500' : ''}`}
                onClick={() => setSelectedPlan(plan.level)}
              >
                <CardHeader className="text-center">
                  {plan.recommended && (
                    <Badge className="w-fit mx-auto mb-2 bg-purple-500">
                      Most Popular
                    </Badge>
                  )}
                  <CardTitle className={`text-xl text-${plan.color}-600`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price} ETB
                    </span>
                    <span className="text-gray-600"> / {plan.duration} days</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Information */}
          {selectedPlan && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
              <p className="text-sm text-gray-600 mb-4">
                Secure payment powered by Stripe. You'll be redirected to complete your payment.
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {BOOST_PLANS.find(p => p.level === selectedPlan)?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {BOOST_PLANS.find(p => p.level === selectedPlan)?.duration} days boost
                  </p>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {BOOST_PLANS.find(p => p.level === selectedPlan)?.price} ETB
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleBoost}
              disabled={!selectedPlan || boostMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {boostMutation.isPending ? (
                'Processing...'
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Boost Listing
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}