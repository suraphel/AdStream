import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Bell, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface NotificationPreferences {
  favoriteMatchNotifications: boolean;
  smsNotifications: boolean;
  phoneNumber?: string;
}

interface NotificationStats {
  totalNotifications: number;
  last30Days: number;
  notificationsEnabled: boolean;
  smsEnabled: boolean;
  deliverySuccess: number;
  deliveryFailed: number;
}

export function NotificationSettings() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ['/api/notifications/preferences'],
  });

  // Fetch notification stats
  const { data: stats } = useQuery<NotificationStats>({
    queryKey: ['/api/notifications/stats'],
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      await apiRequest('POST', '/api/notifications/preferences', newPreferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/stats'] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update notification settings",
        variant: "destructive",
      });
    },
  });

  // Test SMS mutation
  const testSMSMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/notifications/test-sms', { 
        phoneNumber: phoneNumber || preferences?.phoneNumber 
      });
    },
    onSuccess: () => {
      toast({
        title: "Test SMS Sent",
        description: "Check the console for the test message content.",
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test SMS",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavoriteNotifications = (enabled: boolean) => {
    updatePreferencesMutation.mutate({
      favoriteMatchNotifications: enabled,
    });
  };

  const handleToggleSMSNotifications = (enabled: boolean) => {
    const phone = phoneNumber || preferences?.phoneNumber;
    if (enabled && (!phone || !phone.startsWith('+251'))) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid Ethiopian phone number (+251XXXXXXXXX) to enable SMS notifications.",
        variant: "destructive",
      });
      return;
    }

    updatePreferencesMutation.mutate({
      smsNotifications: enabled,
      phoneNumber: phone,
    });
  };

  const handleUpdatePhoneNumber = () => {
    if (!phoneNumber.startsWith('+251')) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Ethiopian phone number starting with +251",
        variant: "destructive",
      });
      return;
    }

    updatePreferencesMutation.mutate({
      phoneNumber,
      smsNotifications: preferences?.smsNotifications || false,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 animate-pulse rounded" />
            <div className="h-12 bg-gray-200 animate-pulse rounded" />
            <div className="h-16 bg-gray-200 animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Favorite Match Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Favorite Match Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new listings similar to your favorites are posted
              </p>
            </div>
            <Switch
              checked={preferences?.favoriteMatchNotifications || false}
              onCheckedChange={handleToggleFavoriteNotifications}
              disabled={updatePreferencesMutation.isPending}
            />
          </div>

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via SMS to your phone
                </p>
              </div>
              <Switch
                checked={preferences?.smsNotifications || false}
                onCheckedChange={handleToggleSMSNotifications}
                disabled={updatePreferencesMutation.isPending}
              />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  placeholder="+251912345678"
                  value={phoneNumber || preferences?.phoneNumber || ''}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpdatePhoneNumber}
                  disabled={updatePreferencesMutation.isPending || !phoneNumber}
                  variant="outline"
                >
                  Update
                </Button>
              </div>
              {preferences?.phoneNumber && (
                <p className="text-xs text-muted-foreground">
                  Current: {preferences.phoneNumber}
                </p>
              )}
            </div>

            {/* Test SMS Button */}
            {preferences?.smsNotifications && preferences?.phoneNumber && (
              <Button
                onClick={() => testSMSMutation.mutate()}
                disabled={testSMSMutation.isPending}
                variant="outline"
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                {testSMSMutation.isPending ? 'Sending...' : 'Send Test SMS'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stats.totalNotifications}</div>
                <div className="text-sm text-muted-foreground">Total Notifications</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stats.last30Days}</div>
                <div className="text-sm text-muted-foreground">Last 30 Days</div>
              </div>
              <div className="space-y-2">
                <Badge variant={stats.smsEnabled ? "default" : "secondary"}>
                  {stats.smsEnabled ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  SMS {stats.smsEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  Success Rate: {stats.totalNotifications > 0 
                    ? Math.round((stats.deliverySuccess / stats.totalNotifications) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.deliverySuccess} sent, {stats.deliveryFailed} failed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}