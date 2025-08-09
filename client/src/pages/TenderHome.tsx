import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Calendar, Building2, DollarSign, Eye, User } from 'lucide-react';
import { Link } from 'wouter';

interface TenderDocument {
  id: number;
  title: string;
  briefDescription: string;
  category: string;
  price: number;
  currency: string;
  company: {
    name: string;
  };
  deadline: string;
  uploadDate: string;
  viewCount: number;
}

const TenderHome: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  // STANDALONE MODE: Use mock data instead of API calls
  const tenderDocuments: TenderDocument[] = [];
  const isLoading = false;
  const categories: string[] = [];

  const filteredTenders = tenderDocuments.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tender.briefDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tender.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            TenderFloat
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Access comprehensive tender documents from verified companies
          </p>
          
          {/* Tender Registration Section for Authenticated Users */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 mb-6">
              Register for tender services to access and upload documents
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Register as User</h3>
                  <p className="text-gray-600 mb-4">
                    Purchase and download tender documents from verified companies
                  </p>
                  <Link href="/tender/register-user">
                    <Button className="w-full">
                      Register for Document Access
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Register as Company</h3>
                  <p className="text-gray-600 mb-4">
                    Upload and sell your tender documents to interested buyers
                  </p>
                  <Link href="/tender/register-company">
                    <Button variant="outline" className="w-full">
                      Register Company Account
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tender documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{tenderDocuments.length}</p>
                  <p className="text-gray-600">Active Tenders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{new Set(tenderDocuments.map(t => t.company.name)).size}</p>
                  <p className="text-gray-600">Registered Companies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">
                    {formatPrice(
                      tenderDocuments.reduce((sum, t) => sum + t.price, 0) / tenderDocuments.length || 0,
                      'ETB'
                    )}
                  </p>
                  <p className="text-gray-600">Avg. Document Price</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tender Documents */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Tender Documents</h2>
            <span className="text-sm text-gray-500">
              {filteredTenders.length} documents found
            </span>
          </div>

          {isLoading ? (
            <div className="grid gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTenders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tender documents found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or category filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredTenders.map((tender) => (
                <Card key={tender.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-primary transition-colors">
                            {tender.title}
                          </h3>
                          {tender.deadline && isDeadlineSoon(tender.deadline) && (
                            <Badge variant="destructive" className="text-xs">
                              Deadline Soon
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {tender.category}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {tender.briefDescription}
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600">
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
                              <span>Deadline {formatDate(tender.deadline)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{tender.viewCount} views</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 text-right">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {formatPrice(tender.price, tender.currency)}
                        </div>
                        <Link href={`/tender/${tender.id}`}>
                          <Button className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              How TenderFloat Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Browse Tenders</h4>
                <p className="text-gray-600 text-sm">
                  Browse and search through available tender documents from verified companies
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Purchase Access</h4>
                <p className="text-gray-600 text-sm">
                  Register and purchase access to download full tender documents securely
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Download Documents</h4>
                <p className="text-gray-600 text-sm">
                  Access and download complete tender documents with full specifications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TenderHome;