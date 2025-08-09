import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Smartphone, Bell, Settings } from 'lucide-react';

interface FavoritesNotificationProps {
  phoneNumber?: string;
  smsNotificationsEnabled?: boolean;
  favoriteMatchNotifications?: boolean;
}

export function FavoritesNotification({
  phoneNumber: initialPhone = '',
  smsNotificationsEnabled = false,
  favoriteMatchNotifications = false,
}: FavoritesNotificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [notifyEnabled, setNotifyEnabled] = useState(favoriteMatchNotifications);
  const [smsEnabled, setSmsEnabled] = useState(smsNotificationsEnabled);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: {
      phoneNumber?: string;
      favoriteMatchNotifications: boolean;
      smsNotifications: boolean;
    }) => {
      await apiRequest('POST', '/api/notifications/preferences', data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    // Validate phone number if SMS notifications are enabled
    if (smsEnabled && (!phoneNumber || !phoneNumber.startsWith('+251'))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Ethiopian phone number starting with +251",
        variant: "destructive",
      });
      return;
    }

    updateNotificationsMutation.mutate({
      phoneNumber: smsEnabled ? phoneNumber : undefined,
      favoriteMatchNotifications: notifyEnabled,
      smsNotifications: smsEnabled,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification Preferences</CardTitle>
        </div>
        <CardDescription>
          Get notified when new listings match your favorited items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Favorite Match Notifications */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="favorite-notifications"
            checked={notifyEnabled}
            onCheckedChange={(checked) => setNotifyEnabled(checked as boolean)}
          />
          <Label htmlFor="favorite-notifications" className="text-sm font-medium">
            Notify me when new listings match my favorites
          </Label>
        </div>

        <div className="pl-6 space-y-4">
          <p className="text-sm text-gray-600">
            When you favorite an item, we'll automatically notify you when similar items 
            in the same category and location become available.
          </p>

          {/* SMS Notifications */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms-notifications"
                checked={smsEnabled}
                onCheckedChange={(checked) => setSmsEnabled(checked as boolean)}
                disabled={!notifyEnabled}
              />
              <Label htmlFor="sms-notifications" className="text-sm font-medium">
                Send SMS notifications
              </Label>
              <Smartphone className="h-4 w-4 text-gray-400" />
            </div>

            {smsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="phone-number" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="+251911234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="max-w-sm"
                />
                <p className="text-xs text-gray-500">
                  Enter your Ethiopian phone number with country code (+251)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Example Notification */}
        {notifyEnabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900">Example Notification</h4>
                <p className="text-sm text-blue-700 mt-1">
                  "New iPhone 14 Pro available in Addis Ababa - similar to your favorited item. View listing: https://ethiomarket.com/listing/12345"
                </p>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={updateNotificationsMutation.isPending}
          className="w-full"
        >
          {updateNotificationsMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}