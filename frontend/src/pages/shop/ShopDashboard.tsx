import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Layout } from '@/components/Layout';
import { ShopNav } from '@/components/ShopNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';
import { formatPrice } from '@/lib/i18n';

interface Shop {
  id: string;
  name: string;
  slug: string;
  status: string;
  currency: string;
  totalSales?: number;
  totalOrders?: number;
}

interface FinancialSummary {
  fiscalYear: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalVat: number;
  totalOrders: number;
  currency: string;
}

export default function ShopDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's shop
  const { data: shop, isLoading: shopLoading } = useQuery<Shop>({
    queryKey: ['/api/shops/my-shop'],
    retry: false,
  });

  // Fetch financial summary
  const { data: financialSummary, isLoading: financialLoading } = useQuery<FinancialSummary>({
    queryKey: ['/api/shops', shop?.id, 'reports/financial-summary'],
    enabled: !!shop?.id,
  });

  // Fetch recent orders
  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/shops', shop?.id, 'orders'],
    enabled: !!shop?.id,
  });

  // Fetch products count
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/shops', shop?.id, 'products'],
    enabled: !!shop?.id,
  });

  if (shopLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shop Found</h2>
            <p className="text-gray-600 mb-6">
              You don't have a shop yet. Create one to start selling your products.
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Shop
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ShopNav />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
            <p className="text-gray-600">Shop Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={shop.status === 'active' ? 'default' : 'secondary'}>
              {shop.status}
            </Badge>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialSummary ? formatPrice(financialSummary.totalIncome, 'en', shop.currency) : '...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Fiscal Year {financialSummary?.fiscalYear || 'Current'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialSummary?.totalOrders || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialSummary ? formatPrice(financialSummary.netProfit, 'en', shop.currency) : '...'}
              </div>
              <p className="text-xs text-muted-foreground">
                After expenses and taxes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialSummary ? formatPrice(financialSummary.totalVat, 'en', shop.currency) : '...'}
              </div>
              <p className="text-xs text-muted-foreground">
                Ethiopian VAT (15%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {(recentOrders as any[]).slice(0, 5).map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">#{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(parseFloat(order.totalAmount), 'en', shop.currency)}</p>
                            <Badge variant={
                              order.status === 'delivered' ? 'default' :
                              order.status === 'cancelled' ? 'destructive' :
                              'secondary'
                            }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Products</span>
                      <span className="text-2xl font-bold">{products.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Products</span>
                      <span className="text-lg font-semibold">
                        {(products as any[]).filter(p => p.isActive).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Featured Products</span>
                      <span className="text-lg font-semibold">
                        {(products as any[]).filter(p => p.isFeatured).length}
                      </span>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Package className="w-4 h-4 mr-2" />
                      Manage Products
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Product management interface would go here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Order management interface would go here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounting">
            <Card>
              <CardHeader>
                <CardTitle>Ethiopian Accounting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tax Compliance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>VAT Rate:</span>
                        <span>15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TIN Number:</span>
                        <span>{shop.tinNumber || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT Number:</span>
                        <span>{shop.vatNumber || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fiscal Year</h3>
                    <p className="text-sm text-gray-600">
                      Ethiopian fiscal year runs from July 1 to June 30
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Fiscal Year:</span>
                        <span>{financialSummary?.fiscalYear}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <BarChart3 className="w-6 h-6 mb-2" />
                    Sales Report
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <FileText className="w-6 h-6 mb-2" />
                    VAT Report
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <TrendingUp className="w-6 h-6 mb-2" />
                    Profit & Loss
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}