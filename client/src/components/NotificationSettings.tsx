import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationPreferences {
  favoriteMatchNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface NotificationData {
  preferences: NotificationPreferences;
  hasPhone: boolean;
  phone?: string;
}

export function NotificationSettings() {
  const [phone, setPhone] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notificationData, isLoading } = useQuery<NotificationData>({
    queryKey: ["/api/notifications/preferences"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { favoriteMatchNotifications: boolean; phone?: string }) => {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/preferences"] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (notificationData) {
      setNotificationsEnabled(notificationData.preferences.favoriteMatchNotifications);
      setPhone(notificationData.phone || "");
    }
  }, [notificationData]);

  const handleSaveSettings = () => {
    if (notificationsEnabled && !phone.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to enable notifications.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      favoriteMatchNotifications: notificationsEnabled,
      phone: notificationsEnabled ? phone.trim() : undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            <span>Loading notification settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPhoneValid = phone.trim().length >= 10; // Basic validation
  const canEnableNotifications = !notificationsEnabled || isPhoneValid;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Get notified when new listings match your favorited items
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="favorite-notifications" className="text-base font-medium">
              Favorite Match Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive SMS when new listings match your favorites
            </p>
          </div>
          <Switch
            id="favorite-notifications"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
        </div>

        {/* Phone Number Input */}
        {notificationsEnabled && (
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+251 911 234 567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={!isPhoneValid && phone.trim() ? "border-red-500" : ""}
            />
            {!isPhoneValid && phone.trim() && (
              <p className="text-sm text-red-500">
                Please enter a valid phone number (at least 10 digits)
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Include country code (e.g., +251 for Ethiopia)
            </p>
          </div>
        )}

        {/* How it works info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> When you favorite a listing, we'll notify you by SMS when 
            similar items are posted in the same category and location. You can disable this anytime.
          </AlertDescription>
        </Alert>

        {/* Current status */}
        {notificationData?.hasPhone && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Current status:</strong> {notificationData.preferences.favoriteMatchNotifications 
                ? "Notifications are enabled" 
                : "Notifications are disabled"
              }
              {notificationData.phone && ` for ${notificationData.phone}`}
            </AlertDescription>
          </Alert>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={updateMutation.isPending || !canEnableNotifications}
            className="min-w-[120px]"
          >
            {updateMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </div>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>

        {/* Help text */}
        <div className="text-sm text-muted-foreground pt-4 border-t">
          <p className="font-medium mb-2">💡 Pro tip:</p>
          <ul className="space-y-1 text-xs">
            <li>• Add items to your favorites to get notified about similar listings</li>
            <li>• We only send notifications for items in the same category and general location</li>
            <li>• You can turn off notifications anytime by visiting this page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}