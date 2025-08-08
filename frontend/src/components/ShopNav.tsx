import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Plus, Settings, BarChart3 } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export function ShopNav() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  const { data: shop } = useQuery<Shop>({
    queryKey: ['/api/shops/my-shop'],
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">
                {shop ? shop.name : 'Your Shop'}
              </span>
              {shop && (
                <Badge variant={shop.status === 'active' ? 'default' : 'secondary'}>
                  {shop.status}
                </Badge>
              )}
            </div>

            {shop && (
              <nav className="flex items-center space-x-1">
                <Button
                  variant={location === '/shop/dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link href="/shop/dashboard">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!shop ? (
              <Button asChild>
                <Link href="/shop/register">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Shop
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}