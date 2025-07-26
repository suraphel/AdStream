import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Eye, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface FlaggedImage {
  id: number;
  listingId: number;
  imageUrl: string;
  moderationStatus: string;
  moderationScore: string;
  moderationReason: string;
  moderatedAt: string;
  moderatedBy: string;
  createdAt: string;
}

interface ModerationStats {
  status: string;
  count: number;
}

export default function ImageModeration() {
  const [selectedImage, setSelectedImage] = useState<FlaggedImage | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch flagged images
  const { data: flaggedImages, isLoading: isLoadingImages, error: imagesError } = useQuery({
    queryKey: ['/api/images/admin/flagged'],
    queryFn: () => apiRequest('/api/images/admin/flagged'),
  });

  // Fetch moderation statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/images/admin/stats'],
    queryFn: () => apiRequest('/api/images/admin/stats'),
  });

  // Review image mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ imageId, action, reason }: { imageId: number; action: 'approve' | 'reject'; reason: string }) => {
      return apiRequest(`/api/images/admin/review/${imageId}`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/images/admin/flagged'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/admin/stats'] });
      toast({
        title: 'Success',
        description: data.message,
      });
      setIsReviewDialogOpen(false);
      setSelectedImage(null);
      setReviewReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to review image',
        variant: 'destructive',
      });
    },
  });

  // Remoderate image mutation
  const remoderateMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return apiRequest(`/api/images/admin/remoderate/${imageId}`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/images/admin/flagged'] });
      queryClient.invalidateQueries({ queryKey: ['/api/images/admin/stats'] });
      toast({
        title: 'Success',
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remoderate image',
        variant: 'destructive',
      });
    },
  });

  const handleReview = (image: FlaggedImage, action: 'approve' | 'reject') => {
    setSelectedImage(image);
    setReviewAction(action);
    setIsReviewDialogOpen(true);
  };

  const submitReview = () => {
    if (!selectedImage) return;
    
    reviewMutation.mutate({
      imageId: selectedImage.id,
      action: reviewAction,
      reason: reviewReason,
    });
  };

  const handleRemoderate = (imageId: number) => {
    remoderateMutation.mutate(imageId);
  };

  const getModerationBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (imagesError) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load image moderation data. Please check your admin permissions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Moderation</h1>
        <p className="text-gray-600">Review and moderate uploaded images for inappropriate content</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {isLoadingStats ? (
          <div className="col-span-4 text-center py-8">Loading statistics...</div>
        ) : (
          stats?.stats?.map((stat: ModerationStats) => (
            <Card key={stat.status}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">{stat.status}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                  </div>
                  <Badge className={getModerationBadgeColor(stat.status)}>
                    {stat.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Flagged Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Flagged Images Awaiting Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingImages ? (
            <div className="text-center py-8">Loading flagged images...</div>
          ) : flaggedImages?.images?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No flagged images awaiting review
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flaggedImages?.images?.map((image: FlaggedImage) => (
                <Card key={image.id} className="border border-orange-200">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <img
                        src={image.imageUrl}
                        alt="Flagged content"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/300/200';
                        }}
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${getModerationBadgeColor(image.moderationStatus)}`}
                      >
                        {image.moderationStatus}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="font-medium">Score: </span>
                        <span className="text-red-600 font-mono">
                          {(parseFloat(image.moderationScore) * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      {image.moderationReason && (
                        <div className="text-sm">
                          <span className="font-medium">Reason: </span>
                          <span className="text-gray-600">{image.moderationReason}</span>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        Listing ID: {image.listingId}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReview(image, 'approve')}
                        className="flex-1"
                        disabled={reviewMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(image, 'reject')}
                        className="flex-1"
                        disabled={reviewMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoderate(image.id)}
                        disabled={remoderateMutation.isPending}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedImage && (
              <div>
                <img
                  src={selectedImage.imageUrl}
                  alt="Image under review"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                
                <div className="text-sm text-gray-600 mb-4">
                  <div>ID: {selectedImage.id}</div>
                  <div>Listing: {selectedImage.listingId}</div>
                  <div>Score: {(parseFloat(selectedImage.moderationScore) * 100).toFixed(1)}%</div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <Textarea
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder={`Reason for ${reviewAction}ing this image...`}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
                disabled={reviewMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                disabled={reviewMutation.isPending}
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              >
                {reviewMutation.isPending ? 'Processing...' : `${reviewAction === 'approve' ? 'Approve' : 'Reject'} Image`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}