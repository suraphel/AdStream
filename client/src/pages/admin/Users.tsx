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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Calendar,
  Mail,
  Phone
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  role: 'User' | 'Moderator' | 'Admin';
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  listingCount: number;
  favoriteCount: number;
  isSuspended: boolean;
  suspensionReason?: string;
  suspensionExpiry?: string;
}

interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function AdminUsers() {
  const { language } = useLanguage();
  const { t } = useAdminTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  const { data: usersData, isLoading, error } = useQuery<{ data: PagedResponse<AdminUser> }>({
    queryKey: ['/api/admin/users', { search: searchTerm, role: roleFilter, status: statusFilter, page }],
    retry: false,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: language === 'am' ? 'ተሳክቷል' : "Success",
        description: language === 'am' ? 'የተጠቃሚ ሚና ተሻሽሏል' : "User role updated successfully",
      });
    },
    onError: () => {
      toast({
        title: language === 'am' ? 'ስህተት' : "Error",
        description: language === 'am' ? 'የተጠቃሚ ሚና ማሻሻል አልተሳካም' : "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      await apiRequest(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ 
          reason,
          reasonAm: reason,
          isPermanent: false 
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: language === 'am' ? 'ተሳክቷል' : "Success",
        description: language === 'am' ? 'ተጠቃሚ ታግዷል' : "User suspended successfully",
      });
    },
    onError: () => {
      toast({
        title: language === 'am' ? 'ስህተት' : "Error",
        description: language === 'am' ? 'ተጠቃሚን መግደብ አልተሳካም' : "Failed to suspend user",
        variant: "destructive",
      });
    },
  });

  const unsuspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/users/${userId}/unsuspend`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: language === 'am' ? 'ተሳክቷል' : "Success",
        description: language === 'am' ? 'ተጠቃሚ ቅጣቱ ተነስቷል' : "User unsuspended successfully",
      });
    },
    onError: () => {
      toast({
        title: language === 'am' ? 'ስህተት' : "Error",
        description: language === 'am' ? 'ተጠቃሚን መልሰው መፍቀድ አልተሳካም' : "Failed to unsuspend user",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleSuspendUser = (userId: string) => {
    const reason = prompt(language === 'am' ? 'የማግደብ ምክንያት ያስገቡ:' : 'Enter suspension reason:');
    if (reason) {
      suspendUserMutation.mutate({ userId, reason });
    }
  };

  const handleUnsuspendUser = (userId: string) => {
    unsuspendUserMutation.mutate(userId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin': return 'default';
      case 'Moderator': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      'Admin': language === 'am' ? 'አድሚን' : 'Admin',
      'Moderator': language === 'am' ? 'ሞዴሬተር' : 'Moderator',
      'User': language === 'am' ? 'ተጠቃሚ' : 'User'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{language === 'am' ? 'ተጠቃሚዎች' : 'Users'}</h1>
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
            <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'am' ? 'ስህተት' : 'Error'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'am' ? 'ተጠቃሚዎችን መጫን አልተሳካም' : 'Failed to load users'}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const users = usersData?.data?.data || [];
  const totalCount = usersData?.data?.totalCount || 0;
  const totalPages = usersData?.data?.totalPages || 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'am' ? 'ተጠቃሚዎች' : 'Users'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {language === 'am' ? `ጠቅላላ ${totalCount} ተጠቃሚዎች` : `Total ${totalCount} users`}
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
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={language === 'am' ? 'ተጠቃሚ ይፈልጉ...' : 'Search users...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'am' ? 'ሚና' : 'Role'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'am' ? 'ሁሉም ሚናዎች' : 'All Roles'}</SelectItem>
                  <SelectItem value="Admin">{language === 'am' ? 'አድሚን' : 'Admin'}</SelectItem>
                  <SelectItem value="Moderator">{language === 'am' ? 'ሞዴሬተር' : 'Moderator'}</SelectItem>
                  <SelectItem value="User">{language === 'am' ? 'ተጠቃሚ' : 'User'}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'am' ? 'ሁኔታ' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'am' ? 'ሁሉም ሁኔታዎች' : 'All Status'}</SelectItem>
                  <SelectItem value="active">{language === 'am' ? 'ንቁ' : 'Active'}</SelectItem>
                  <SelectItem value="suspended">{language === 'am' ? 'የታገደ' : 'Suspended'}</SelectItem>
                  <SelectItem value="unverified">{language === 'am' ? 'ያልተረጋገጠ' : 'Unverified'}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setStatusFilter("all");
                setPage(1);
              }}>
                {language === 'am' ? 'ፅዳ' : 'Clear'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'am' ? 'ተጠቃሚ' : 'User'}</TableHead>
                  <TableHead>{language === 'am' ? 'ሚና' : 'Role'}</TableHead>
                  <TableHead>{language === 'am' ? 'ሁኔታ' : 'Status'}</TableHead>
                  <TableHead>{language === 'am' ? 'ማስታወቂያዎች' : 'Listings'}</TableHead>
                  <TableHead>{language === 'am' ? 'የተቀላቀለበት ቀን' : 'Joined'}</TableHead>
                  <TableHead>{language === 'am' ? 'እርምጃዎች' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.isSuspended ? 'bg-red-500' : 
                          user.isActive ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-sm">
                          {user.isSuspended 
                            ? (language === 'am' ? 'የታገደ' : 'Suspended')
                            : user.isActive 
                            ? (language === 'am' ? 'ንቁ' : 'Active')
                            : (language === 'am' ? 'ቦዝ' : 'Inactive')
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.listingCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(user.createdAt)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDialog(true);
                          }}
                        >
                          {language === 'am' ? 'ይመልከቱ' : 'View'}
                        </Button>
                        
                        {user.isSuspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnsuspendUser(user.id)}
                            disabled={unsuspendUserMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            {language === 'am' ? 'ቅጣቱን ያንሱ' : 'Unsuspend'}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendUser(user.id)}
                            disabled={suspendUserMutation.isPending}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            {language === 'am' ? 'ይግደቡ' : 'Suspend'}
                          </Button>
                        )}
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

        {/* User Detail Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{language === 'am' ? 'የተጠቃሚ ዝርዝሮች' : 'User Details'}</DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'am' ? 'ስም' : 'Name'}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'am' ? 'ኢሜይል' : 'Email'}
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'am' ? 'ስልክ' : 'Phone'}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.phoneNumber || (language === 'am' ? 'አልተሰጠም' : 'Not provided')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'am' ? 'ሚና' : 'Role'}
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                        {getRoleLabel(selectedUser.role)}
                      </Badge>
                      <Select 
                        value={selectedUser.role} 
                        onValueChange={(newRole) => handleRoleChange(selectedUser.id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="User">{language === 'am' ? 'ተጠቃሚ' : 'User'}</SelectItem>
                          <SelectItem value="Moderator">{language === 'am' ? 'ሞዴሬተር' : 'Moderator'}</SelectItem>
                          <SelectItem value="Admin">{language === 'am' ? 'አድሚን' : 'Admin'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedUser.listingCount}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'am' ? 'ማስታወቂያዎች' : 'Listings'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'am' ? 'የተቀላቀለበት ቀን' : 'Joined'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {selectedUser.isEmailVerified 
                        ? (language === 'am' ? 'የተረጋገጠ' : 'Verified')
                        : (language === 'am' ? 'ያልተረጋገጠ' : 'Unverified')
                      }
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'am' ? 'ኢሜይል ማረጋገጥ' : 'Email Status'}
                    </p>
                  </div>
                </div>

                {selectedUser.isSuspended && selectedUser.suspensionReason && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      {language === 'am' ? 'የታገደበት ምክንያት' : 'Suspension Reason'}
                    </h4>
                    <p className="text-red-700 dark:text-red-300">{selectedUser.suspensionReason}</p>
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

export default AdminUsers;