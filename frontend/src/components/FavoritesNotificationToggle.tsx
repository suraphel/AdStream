import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Bell, BellOff, MessageSquare, Phone, Settings, CheckCircle } from 'lucide-react';

interface NotificationSettings {
  favoriteMatchNotifications: boolean;
  smsNotifications: boolean;
  phoneNumber: string;
}

interface FavoritesNotificationToggleProps {
  favoriteId: number;
  listingTitle: string;
  categoryName: string;
  initialSettings?: NotificationSettings;
}

export function FavoritesNotificationToggle({ 
  favoriteId, 
  listingTitle, 
  categoryName,
  initialSettings 
}: FavoritesNotificationToggleProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    favoriteMatchNotifications: initialSettings?.favoriteMatchNotifications ?? false,
    smsNotifications: initialSettings?.smsNotifications ?? false,
    phoneNumber: initialSettings?.phoneNumber ?? '',
  });
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateNotificationsMutation = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      return await apiRequest('POST', '/api/notifications/preferences', newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "You'll be notified about similar listings in this category.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update settings",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleNotifications = async (enabled: boolean) => {
    const newSettings = { 
      ...settings, 
      favoriteMatchNotifications: enabled 
    };
    setSettings(newSettings);
    updateNotificationsMutation.mutate(newSettings);
  };

  const handleToggleSMS = async (enabled: boolean) => {
    if (enabled && !settings.phoneNumber) {
      setShowPhoneInput(true);
      return;
    }
    
    const newSettings = { 
      ...settings, 
      smsNotifications: enabled 
    };
    setSettings(newSettings);
    updateNotificationsMutation.mutate(newSettings);
  };

  const handlePhoneSubmit = () => {
    if (!settings.phoneNumber.startsWith('+251')) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Ethiopian phone number (+251XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    const newSettings = { 
      ...settings, 
      smsNotifications: true 
    };
    setSettings(newSettings);
    updateNotificationsMutation.mutate(newSettings);
    setShowPhoneInput(false);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Smart Notifications
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              Notify me about similar listings
            </Label>
            <p className="text-xs text-muted-foreground">
              Get alerts when new {categoryName.toLowerCase()} listings match this item
            </p>
          </div>
          <Switch
            checked={settings.favoriteMatchNotifications}
            onCheckedChange={handleToggleNotifications}
            disabled={updateNotificationsMutation.isPending}
          />
        </div>

        {/* SMS Toggle - Only show if notifications are enabled */}
        {settings.favoriteMatchNotifications && (
          <div className="flex items-center justify-between pl-4 border-l-2 border-gray-200">
            <div className="space-y-1">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive instant SMS alerts on your phone
              </p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={handleToggleSMS}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>
        )}

        {/* Phone Number Input */}
        {showPhoneInput && (
          <div className="space-y-3 p-3 bg-blue-50 rounded-lg border">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Ethiopian Phone Number
            </Label>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+251912345678"
                value={settings.phoneNumber}
                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                className="flex-1"
              />
              <Button onClick={handlePhoneSubmit} size="sm">
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your phone number to receive SMS notifications
            </p>
          </div>
        )}

        {/* Current Settings Display */}
        {settings.smsNotifications && settings.phoneNumber && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              SMS notifications enabled for {settings.phoneNumber}
            </AlertDescription>
          </Alert>
        )}

        {/* Expanded Settings */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-sm font-medium">Notification Preferences</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Badge variant={settings.favoriteMatchNotifications ? "default" : "secondary"}>
                {settings.favoriteMatchNotifications ? "Notifications On" : "Notifications Off"}
              </Badge>
              <Badge variant={settings.smsNotifications ? "default" : "secondary"}>
                {settings.smsNotifications ? "SMS Enabled" : "SMS Disabled"}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Matching criteria: Category, location, price range (±20%)</p>
              <p>• Frequency: Instant notifications for new listings</p>
              <p>• Privacy: Your phone number is kept secure</p>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Smart notifications for "{listingTitle}"</span>
          {settings.favoriteMatchNotifications ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <BellOff className="h-3 w-3" />
              Disabled
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}