import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ExternalLink, MapPin, DollarSign, Building, Home, Plane } from "lucide-react";

interface ExternalProvider {
  provider: string;
  baseUrl: string;
  isActive: boolean;
  dailyLimit: number;
  usageCount: number;
  description: string;
}

interface ExternalConfig {
  providers: ExternalProvider[];
  documentation: Record<string, string>;
}

export default function ExternalListings() {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number>(10); // Default to electronics
  const [propertyType, setPropertyType] = useState<string>("All");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch external configuration
  const { data: config, isLoading: configLoading } = useQuery<ExternalConfig>({
    queryKey: ["/api/external/config"],
    retry: false,
  });

  // Fetch categories for the category selector
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    retry: false,
  });

  // Import listings mutation
  const importMutation = useMutation({
    mutationFn: async (data: {
      provider: string;
      location: string;
      categoryId: number;
      propertyType?: string;
    }) => {
      return await apiRequest("/api/external/import", "POST", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Import Successful",
        description: `Imported ${data.imported} listings from ${data.provider}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    if (!selectedProvider || !location) {
      toast({
        title: "Missing Information",
        description: "Please select a provider and enter a location",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate({
      provider: selectedProvider,
      location: location.trim(),
      categoryId,
      propertyType: selectedProvider === 'rentcast' ? propertyType : undefined,
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'rentcast':
        return <Home className="h-5 w-5" />;
      case 'hasdata_zillow':
        return <Building className="h-5 w-5" />;
      case 'opentrip':
        return <Plane className="h-5 w-5" />;
      default:
        return <ExternalLink className="h-5 w-5" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'rentcast':
        return 'bg-blue-500';
      case 'hasdata_zillow':
        return 'bg-green-500';
      case 'opentrip':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">External Listings Integration</h1>
          <p className="text-muted-foreground">
            Expand your marketplace by importing listings from trusted external platforms
          </p>
        </div>

        {/* Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Available Providers</CardTitle>
            <CardDescription>
              Choose from our integrated partners to import high-quality listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {config?.providers.map((provider) => (
                <Card 
                  key={provider.provider}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProvider === provider.provider ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedProvider(provider.provider)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-full ${getProviderColor(provider.provider)} text-white`}>
                        {getProviderIcon(provider.provider)}
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">
                          {provider.provider.replace('_', ' ')}
                        </h3>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Active" : "Setup Required"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {provider.description}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Daily Limit: {provider.dailyLimit}</span>
                      <span>Used: {provider.usageCount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Import Configuration */}
        {selectedProvider && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getProviderIcon(selectedProvider)}
                <span>Import from {selectedProvider.replace('_', ' ')}</span>
              </CardTitle>
              <CardDescription>
                Configure your import settings below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Addis Ababa, Ethiopia"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId.toString()} onValueChange={(value) => setCategoryId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories as any)?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProvider === 'rentcast' && (
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Condo">Condo</SelectItem>
                        <SelectItem value="Townhouse">Townhouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Ready to Import</p>
                  <p className="text-xs text-muted-foreground">
                    This will search for listings in {location || "the specified location"} and import them to your marketplace
                  </p>
                </div>
                <Button 
                  onClick={handleImport}
                  disabled={importMutation.isPending || !location}
                  className="min-w-[120px]"
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Import Listings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Learn more about our external integration partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {config?.documentation && Object.entries(config.documentation).map(([provider, url]) => (
                <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getProviderIcon(provider)}
                    <span className="font-medium capitalize">{provider.replace('_', ' ')}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Docs
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}