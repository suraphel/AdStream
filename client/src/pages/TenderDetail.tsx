import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Building2, Calendar, DollarSign, Download, Eye, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TenderDocument {
  id: number;
  title: string;
  description: string;
  briefDescription: string;
  category: string;
  price: number;
  currency: string;
  company: {
    id: number;
    name: string;
    contactPerson: string;
  };
  deadline: string;
  uploadDate: string;
  viewCount: number;
  downloadCount: number;
  fileName: string;
  fileSize: number;
}

interface UserPurchase {
  id: number;
  tenderId: number;
  paymentStatus: string;
  purchaseDate: string;
  downloadCount: number;
}

const TenderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tender, isLoading } = useQuery<TenderDocument>({
    queryKey: [`/api/tenders/${id}`],
  });

  const { data: userPurchase } = useQuery<UserPurchase | null>({
    queryKey: [`/api/tenders/${id}/purchase`],
    enabled: !!id,
  });

  const { data: user } = useQuery({
    queryKey: ['/api/tender-auth/user'],
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/tenders/${id}/purchase`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful",
        description: "You can now download the tender document. Check your email for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${id}/purchase`] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tenders/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tender_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tender?.fileName || 'tender-document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download Started",
        description: "Your tender document download has begun.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/tenders/${id}/purchase`] });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tender) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tender Document Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The tender document you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/tender')}>
            Back to Tenders
          </Button>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: currency === 'ETB' ? 'ETB' : 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const isDeadlinePassed = tender.deadline && new Date(tender.deadline) < new Date();
  const canPurchase = user && !userPurchase && !isDeadlinePassed;
  const canDownload = userPurchase && userPurchase.paymentStatus === 'completed';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span onClick={() => navigate('/tender')} className="hover:text-primary cursor-pointer">
              Tenders
            </span>
            <span>/</span>
            <span className="text-gray-900">{tender.category}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {tender.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{tender.company.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDate(tender.uploadDate)}</span>
            </div>
            {tender.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className={isDeadlinePassed ? 'text-red-600' : ''}>
                  Deadline {formatDate(tender.deadline)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{tender.viewCount} views</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tender Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {tender.description}
                  </p>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Category:</span>
                    <Badge variant="outline" className="ml-2">
                      {tender.category}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">File Size:</span>
                    <span className="ml-2 text-gray-600">
                      {formatFileSize(tender.fileSize)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Downloads:</span>
                    <span className="ml-2 text-gray-600">
                      {tender.downloadCount} times
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Contact Person:</span>
                    <span className="ml-2 text-gray-600">
                      {tender.company.contactPerson}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Document Access</span>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(tender.price, tender.currency)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user && (
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      You need to register and log in to purchase this document.
                    </AlertDescription>
                  </Alert>
                )}

                {user && userPurchase && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      You have purchased this document on {formatDate(userPurchase.purchaseDate)}.
                      Downloaded {userPurchase.downloadCount} times.
                    </AlertDescription>
                  </Alert>
                )}

                {isDeadlinePassed && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      The deadline for this tender has passed.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  {!user && (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => navigate('/api/login')}
                      >
                        Login to Marketplace First
                      </Button>
                      <p className="text-sm text-gray-600 text-center">
                        You need to login to your marketplace account, then register for tender services
                      </p>
                    </div>
                  )}

                  {canPurchase && (
                    <Button
                      className="w-full"
                      onClick={() => purchaseMutation.mutate()}
                      disabled={purchaseMutation.isPending}
                    >
                      {purchaseMutation.isPending ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Purchase Document
                        </>
                      )}
                    </Button>
                  )}

                  {canDownload && (
                    <Button
                      className="w-full"
                      onClick={() => downloadMutation.mutate()}
                      disabled={downloadMutation.isPending}
                    >
                      {downloadMutation.isPending ? (
                        <>Downloading...</>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download Document
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500 text-center">
                  <p>✓ Secure payment processing</p>
                  <p>✓ Instant access after payment</p>
                  <p>✓ Email confirmation included</p>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-900">Company:</span>
                    <p className="text-gray-600">{tender.company.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Contact Person:</span>
                    <p className="text-gray-600">{tender.company.contactPerson}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TenderDetail;