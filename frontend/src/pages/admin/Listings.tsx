import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import useAdminTranslation from "@/hooks/useAdminTranslation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Calendar,
  DollarSign
} from "lucide-react";

interface AdminListing {
  id: number;
  title: string;
  titleAm: string;
  description: string;
  descriptionAm: string;
  price: number;
  currency: string;
  location: string;
  locationAm: string;
  condition: string;
  status: 'Draft' | 'Active' | 'Sold' | 'Expired' | 'Deleted';
  isFeatured: boolean;
  isNegotiable: boolean;
  viewCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  categoryId: number;
  categoryName?: string;
  categoryNameAm?: string;
  isFlagged: boolean;
  flagReason?: string;
  flagCount: number;
  adminNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function AdminListings() {
  const { language } = useLanguage();
  const { t } = useAdminTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [flaggedFilter, setFlaggedFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [showListingDialog, setShowListingDialog] = useState(false);

  const { data: listingsData, isLoading, error } = useQuery<{ data: PagedResponse<AdminListing> }>({
    queryKey: ['/api/admin/listings', { 
      search: searchTerm, 
      status: statusFilter, 
      category: categoryFilter,
      flagged: flaggedFilter,
      page 
    }],
    retry: false,
  });

  const { data: categoriesData } = useQuery<{ data: any[] }>({
    queryKey: ['/api/categories'],
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ listingId, status, reason }: { listingId: number; status: string; reason?: string }) => {
      await apiRequest(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status,
          reason,
          reasonAm: reason,
          adminNotes: reason 
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      toast({
        title: language === 'am' ? 'ተሳክቷል' : "Success",
        description: language === 'am' ? 'የማስታወቂያ ሁኔታ ተሻሽሏል' : "Listing status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: language === 'am' ? 'ስህተት' : "Error",
        description: language === 'am' ? 'የማስታወቂያ ሁኔታ ማሻሻል አልተሳካም' : "Failed to update listing status",
        variant: "destructive",
      });
    },
  });

  const featureMutation = useMutation({
    mutationFn: async ({ listingId, isFeatured }: { listingId: number; isFeatured: boolean }) => {
      await apiRequest(`/api/admin/listings/${listingId}/feature`, {
        method: 'PUT',
        body: JSON.stringify({ 
          isFeatured,
          reason: isFeatured ? 'Featured by admin' : 'Unfeatured by admin'
        })
      });
    },
    onSuccess: (_, { isFeatured }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      toast({
        title: language === 'am' ? 'ተሳክቷል' : "Success",
        description: isFeatured 
          ? (language === 'am' ? 'ማስታወቂያው ተለይቷል' : "Listing featured successfully")
          : (language === 'am' ? 'ማስታወቂያው አልተለየም' : "Listing unfeatured successfully"),
      });
    },
    onError: () => {
      toast({
        title: language === 'am' ? 'ስህተት' : "Error",
        description: language === 'am' ? 'የማስታወቂያ ባህሪ ማሻሻል አልተሳካም' : "Failed to update listing feature status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (listingId: number, newStatus: string) => {
    const reason = newStatus === 'Deleted' 
      ? prompt(language === 'am' ? 'የመሰረዝ ምክንያት ያስገቡ:' : 'Enter deletion reason:')
      : undefined;
    
    if (newStatus === 'Deleted' && !reason) return;
    
    updateStatusMutation.mutate({ listingId, status: newStatus, reason });
  };

  const handleToggleFeature = (listingId: number, currentFeatured: boolean) => {
    featureMutation.mutate({ listingId, isFeatured: !currentFeatured });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US', {
      style: 'currency',
      currency: currency === 'ETB' ? 'ETB' : 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Draft': return 'secondary';
      case 'Sold': return 'outline';
      case 'Expired': return 'destructive';
      case 'Deleted': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      'Active': language === 'am' ? 'ንቁ' : 'Active',
      'Draft': language === 'am' ? 'ረቂቅ' : 'Draft',
      'Sold': language === 'am' ? 'ተሽጧል' : 'Sold',
      'Expired': language === 'am' ? 'ጊዜው አልፏል' : 'Expired',
      'Deleted': language === 'am' ? 'ተሰርዟል' : 'Deleted'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getConditionLabel = (condition: string) => {
    const conditionLabels = {
      'New': language === 'am' ? 'አዲስ' : 'New',
      'LikeNew': language === 'am' ? 'እንደ አዲስ' : 'Like New',
      'Good': language === 'am' ? 'ጥሩ' : 'Good',
      'Fair': language === 'am' ? 'መጥፎ' : 'Fair',
      'Poor': language === 'am' ? 'መጥፎ' : 'Poor'
    };
    return conditionLabels[condition as keyof typeof conditionLabels] || condition;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{language === 'am' ? 'ማስታወቂያዎች' : 'Listings'}</h1>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'am' ? 'ስህተት' : 'Error'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'am' ? 'ማስታወቂያዎችን መጫን አልተሳካም' : 'Failed to load listings'}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const listings = listingsData?.data?.data || [];
  const totalCount = listingsData?.data?.totalCount || 0;
  const totalPages = listingsData?.data?.totalPages || 1;
  const categories = categoriesData?.data || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'am' ? 'ማስታወቂያዎች' : 'Listings'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'am' ? `ጠቅላላ ${totalCount} ማስታወቂያዎች` : `Total ${totalCount} listings`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>{language === 'am' ? 'አጣሪዎች' : 'Filters'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={language === 'am' ? 'ማስታወቂያ ይፈልጉ...' : 'Search listings...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'am' ? 'ሁኔታ' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'am' ? 'ሁሉም ሁኔታዎች' : 'All Status'}</SelectItem>
                  <SelectItem value="Active">{language === 'am' ? 'ንቁ' : 'Active'}</SelectItem>
                  <SelectItem value="Draft">{language === 'am' ? 'ረቂቅ' : 'Draft'}</SelectItem>
                  <SelectItem value="Sold">{language === 'am' ? 'ተሽጧል' : 'Sold'}</SelectItem>
                  <SelectItem value="Expired">{language === 'am' ? 'ጊዜው አልፏል' : 'Expired'}</SelectItem>
                  <SelectItem value="Deleted">{language === 'am' ? 'ተሰርዟል' : 'Deleted'}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'am' ? 'ምድብ' : 'Category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'am' ? 'ሁሉም ምድቦች' : 'All Categories'}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {language === 'am' ? category.nameAm : category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={flaggedFilter} onValueChange={setFlaggedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'am' ? 'የተሰየሙ' : 'Flagged'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'am' ? 'ሁሉም' : 'All'}</SelectItem>
                  <SelectItem value="flagged">{language === 'am' ? 'የተሰየሙ ብቻ' : 'Flagged Only'}</SelectItem>
                  <SelectItem value="featured">{language === 'am' ? 'የተለዩ ብቻ' : 'Featured Only'}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setFlaggedFilter("all");
                setPage(1);
              }}>
                {language === 'am' ? 'ፅዳ' : 'Clear'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listings Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'am' ? 'ማስታወቂያ' : 'Listing'}</TableHead>
                  <TableHead>{language === 'am' ? 'ሁኔታ' : 'Status'}</TableHead>
                  <TableHead>{language === 'am' ? 'ዋጋ' : 'Price'}</TableHead>
                  <TableHead>{language === 'am' ? 'ባለቤት' : 'Owner'}</TableHead>
                  <TableHead>{language === 'am' ? 'እይታዎች' : 'Views'}</TableHead>
                  <TableHead>{language === 'am' ? 'ቀን' : 'Date'}</TableHead>
                  <TableHead>{language === 'am' ? 'እርምጃዎች' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {language === 'am' ? listing.titleAm : listing.title}
                          </p>
                          {listing.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          {listing.isFlagged && (
                            <Badge variant="destructive" className="text-xs">
                              {language === 'am' ? 'ተሰይሟል' : 'Flagged'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{language === 'am' ? listing.categoryNameAm : listing.categoryName}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {language === 'am' ? listing.locationAm : listing.location}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(listing.status)}>
                        {getStatusLabel(listing.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatPrice(listing.price, listing.currency)}
                        {listing.isNegotiable && (
                          <span className="text-gray-500 ml-1">
                            ({language === 'am' ? 'ተደራሽ' : 'neg'})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{listing.userName}</p>
                        <p className="text-gray-500">{listing.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{listing.viewCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(listing.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedListing(listing);
                            setShowListingDialog(true);
                          }}
                        >
                          {language === 'am' ? 'ይመልከቱ' : 'View'}
                        </Button>
                        
                        <Select 
                          value={listing.status} 
                          onValueChange={(newStatus) => handleStatusChange(listing.id, newStatus)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">{language === 'am' ? 'ንቁ' : 'Active'}</SelectItem>
                            <SelectItem value="Draft">{language === 'am' ? 'ረቂቅ' : 'Draft'}</SelectItem>
                            <SelectItem value="Sold">{language === 'am' ? 'ተሽጧል' : 'Sold'}</SelectItem>
                            <SelectItem value="Expired">{language === 'am' ? 'ጊዜው አልፏል' : 'Expired'}</SelectItem>
                            <SelectItem value="Deleted">{language === 'am' ? 'ሰርዝ' : 'Delete'}</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant={listing.isFeatured ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleFeature(listing.id, listing.isFeatured)}
                          disabled={featureMutation.isPending}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'am' 
                ? `ገጽ ${page} የ ${totalPages}`
                : `Page ${page} of ${totalPages}`
              }
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                {language === 'am' ? 'ቀዳሚ' : 'Previous'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                {language === 'am' ? 'ቀጣይ' : 'Next'}
              </Button>
            </div>
          </div>
        )}

        {/* Listing Detail Dialog */}
        <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{language === 'am' ? 'የማስታወቂያ ዝርዝሮች' : 'Listing Details'}</DialogTitle>
            </DialogHeader>
            
            {selectedListing && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('listings.listingTitle')}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {language === 'am' ? selectedListing.titleAm : selectedListing.title}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'am' ? 'ዋጋ' : 'Price'}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatPrice(selectedListing.price, selectedListing.currency)}
                      {selectedListing.isNegotiable && (
                        <span className="text-gray-500 ml-2">
                          ({language === 'am' ? 'ተደራሽ' : 'Negotiable'})
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'am' ? 'አካባቢ' : 'Location'}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {language === 'am' ? selectedListing.locationAm : selectedListing.location}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'am' ? 'ሁኔታ' : 'Condition'}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {getConditionLabel(selectedListing.condition)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'am' ? 'መግለጫ' : 'Description'}
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {language === 'am' ? selectedListing.descriptionAm : selectedListing.description}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedListing.viewCount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'am' ? 'እይታዎች' : 'Views'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatDate(selectedListing.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'am' ? 'የተፈጠረበት' : 'Created'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Badge variant={getStatusBadgeVariant(selectedListing.status)} className="mb-2">
                      {getStatusLabel(selectedListing.status)}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'am' ? 'ሁኔታ' : 'Status'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    {selectedListing.isFeatured ? (
                      <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2 fill-current" />
                    ) : (
                      <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedListing.isFeatured 
                        ? (language === 'am' ? 'የተለየ' : 'Featured')
                        : (language === 'am' ? 'መደበኛ' : 'Regular')
                      }
                    </p>
                  </div>
                </div>

                {selectedListing.isFlagged && selectedListing.flagReason && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      {language === 'am' ? 'የተሰየመበት ምክንያት' : 'Flag Reason'}
                    </h4>
                    <p className="text-red-700 dark:text-red-300">{selectedListing.flagReason}</p>
                  </div>
                )}

                {selectedListing.adminNotes && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      {language === 'am' ? 'የአድሚን ማስታወሻዎች' : 'Admin Notes'}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedListing.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default AdminListings;