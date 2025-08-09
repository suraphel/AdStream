import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useFeatures, useAdminPanel } from '@/contexts/FeatureContext';
import { 
  Settings, 
  BarChart3, 
  Users, 
  Database,
  Globe,
  Shield,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Monitor,
  MapPin,
  CreditCard,
  MessageSquare,
  Heart,
  Image,
  Bell,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// Feature icon mapping
const featureIcons = {
  payments: CreditCard,
  chat: MessageSquare,
  mapSearch: MapPin,
  imageUpload: Image,
  favorites: Heart,
  adminPanel: Shield,
  analytics: BarChart3,
  notifications: Bell,
  multilanguage: Globe,
  rtlSupport: Globe,
};

export default function AdminDashboard() {
  const { enabled: isAdminEnabled, isAdmin } = useAdminPanel();
  const { features, config, isLoading: featuresLoading } = useFeatures();

  // Fetch environment info
  const { data: environmentInfo, isLoading: envLoading } = useQuery({
    queryKey: ['/api/environment'],
    enabled: isAdminEnabled,
  });

  // Fetch feature analytics
  const { data: featureAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/features/analytics'],
    enabled: isAdminEnabled && isAdmin,
  });

  // Fetch recent errors
  const { data: recentErrors } = useQuery({
    queryKey: ['/api/errors/recent'],
    enabled: isAdminEnabled,
  });

  // Fetch error analytics
  const { data: errorAnalytics } = useQuery({
    queryKey: ['/api/errors/analytics'],
    enabled: isAdminEnabled,
  });

  if (!isAdminEnabled) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Admin Access Required</h3>
              <p className="text-muted-foreground">This page requires administrator privileges.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = featuresLoading || envLoading || analyticsLoading;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            EthioMarket configuration and feature management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {environmentInfo?.environment || 'development'}
          </Badge>
          <Badge variant="outline">
            v{environmentInfo?.version || '1.0.0'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="localization">Localization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Environment</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {environmentInfo?.environment || 'Development'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current deployment environment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Features Enabled</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {environmentInfo?.features?.enabled || 0}/{environmentInfo?.features?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active feature toggles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Languages</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {config?.localization?.supportedLanguages?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported languages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentErrors?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Database</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>Authentication</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span>File Storage</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>
                Manage feature flags and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(features).map(([featureName, enabled]) => {
                  const IconComponent = featureIcons[featureName as keyof typeof featureIcons] || Settings;
                  return (
                    <div
                      key={featureName}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium capitalize">
                            {featureName.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getFeatureDescription(featureName)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {enabled ? (
                          <ToggleRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                        )}
                        <Badge variant={enabled ? "default" : "secondary"}>
                          {enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Feature Analytics */}
          {featureAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Feature Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {featureAnalytics.enabledFeatures}
                    </div>
                    <p className="text-sm text-muted-foreground">Enabled</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {featureAnalytics.disabledFeatures}
                    </div>
                    <p className="text-sm text-muted-foreground">Disabled</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {featureAnalytics.conditionalFeatures}
                    </div>
                    <p className="text-sm text-muted-foreground">Conditional</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Environment Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <Badge>{environmentInfo?.environment}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <code>{environmentInfo?.version}</code>
                </div>
                <div className="flex justify-between">
                  <span>Default Language:</span>
                  <Badge variant="outline">{config?.localization?.defaultLanguage?.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>RTL Support:</span>
                  <Badge variant={config?.localization?.rtlSupport ? "default" : "secondary"}>
                    {config?.localization?.rtlSupport ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Business Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Business Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Max Listings per User:</span>
                  <code>{config?.business?.maxListingsPerUser}</code>
                </div>
                <div className="flex justify-between">
                  <span>Listing Expiry (days):</span>
                  <code>{config?.business?.listingExpiryDays}</code>
                </div>
                <div className="flex justify-between">
                  <span>Min Search Length:</span>
                  <code>{config?.business?.minSearchQueryLength}</code>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Configurations */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Config */}
                {config?.payments && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payments
                    </h4>
                    <div className="pl-6 space-y-1 text-sm">
                      <div>Provider: {config.payments.provider}</div>
                      <div>Currency: {config.payments.currency}</div>
                    </div>
                  </div>
                )}

                {/* Image Upload Config */}
                {config?.imageUpload && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Image Upload
                    </h4>
                    <div className="pl-6 space-y-1 text-sm">
                      <div>Max Size: {config.imageUpload.maxSize}MB</div>
                      <div>Max Count: {config.imageUpload.maxCount}</div>
                    </div>
                  </div>
                )}

                {/* Chat Config */}
                {config?.chat && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </h4>
                    <div className="pl-6 space-y-1 text-sm">
                      <div>Max Length: {config.chat.maxMessageLength}</div>
                      <div>Moderation: {config.chat.moderation ? 'On' : 'Off'}</div>
                    </div>
                  </div>
                )}

                {/* Maps Config */}
                {config?.maps && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Maps
                    </h4>
                    <div className="pl-6 space-y-1 text-sm">
                      <div>Provider: {config.maps.provider}</div>
                      <div>API Key: {config.maps.hasApiKey ? 'Configured' : 'Missing'}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          {/* Error Analytics */}
          {errorAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {errorAnalytics.totalErrors || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Errors</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {errorAnalytics.criticalErrors || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Critical</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {errorAnalytics.warningErrors || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {errorAnalytics.infoErrors || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Info</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest system errors and issues</CardDescription>
            </CardHeader>
            <CardContent>
              {recentErrors && recentErrors.length > 0 ? (
                <div className="space-y-3">
                  {recentErrors.slice(0, 5).map((error: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{error.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {error.context?.route} • {new Date(error.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="destructive">{error.severity}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  No recent errors
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Metrics
                </Button>
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Database Status
                </Button>
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Health Check
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Localization Tab */}
        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Supported Languages</h4>
                    <div className="flex gap-2">
                      {config?.localization?.supportedLanguages?.map((lang: string) => (
                        <Badge key={lang} variant="default">
                          {lang.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Default Language</h4>
                    <Badge variant="outline">
                      {config?.localization?.defaultLanguage?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">RTL Support</h4>
                    <Badge variant={config?.localization?.rtlSupport ? "default" : "secondary"}>
                      {config?.localization?.rtlSupport ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Language Detection</h4>
                    <Badge variant="outline">
                      {config?.localization?.languageDetection}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Translation Coverage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>English</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Amharic</span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to get feature descriptions
function getFeatureDescription(featureName: string): string {
  const descriptions = {
    payments: 'Telebirr payment integration',
    chat: 'Real-time messaging between users',
    mapSearch: 'Location-based search with maps',
    imageUpload: 'Image upload for listings',
    favorites: 'Save and bookmark listings',
    adminPanel: 'Administrative dashboard access',
    analytics: 'User behavior tracking',
    notifications: 'Push notifications and alerts',
    multilanguage: 'Multiple language support',
    rtlSupport: 'Right-to-left text layout',
  };
  
  return descriptions[featureName as keyof typeof descriptions] || 'Feature toggle';
}