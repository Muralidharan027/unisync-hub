
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [emailNotifications, setEmailNotifications] = useState({
    announcements: true,
    leaveUpdates: true,
    security: true,
  });
  
  const [pushNotifications, setPushNotifications] = useState({
    announcements: false,
    leaveUpdates: false,
    security: true,
  });
  
  const handleEmailChange = (key: keyof typeof emailNotifications) => (checked: boolean) => {
    setEmailNotifications(prev => ({ ...prev, [key]: checked }));
  };
  
  const handlePushChange = (key: keyof typeof pushNotifications) => (checked: boolean) => {
    setPushNotifications(prev => ({ ...prev, [key]: checked }));
  };
  
  const handleSavePreferences = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to save notification preferences",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications from UniSync
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose which emails you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-announcements">Announcements</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new announcements
              </p>
            </div>
            <Switch
              id="email-announcements"
              checked={emailNotifications.announcements}
              onCheckedChange={handleEmailChange('announcements')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-leave">Leave updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about your leave requests
              </p>
            </div>
            <Switch
              id="email-leave"
              checked={emailNotifications.leaveUpdates}
              onCheckedChange={handleEmailChange('leaveUpdates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-security">Security alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about security events
              </p>
            </div>
            <Switch
              id="email-security"
              checked={emailNotifications.security}
              onCheckedChange={handleEmailChange('security')}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Configure browser push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-announcements">Announcements</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications for announcements
              </p>
            </div>
            <Switch
              id="push-announcements"
              checked={pushNotifications.announcements}
              onCheckedChange={handlePushChange('announcements')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-leave">Leave updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications for leave updates
              </p>
            </div>
            <Switch
              id="push-leave"
              checked={pushNotifications.leaveUpdates}
              onCheckedChange={handlePushChange('leaveUpdates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-security">Security alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications for security events
              </p>
            </div>
            <Switch
              id="push-security"
              checked={pushNotifications.security}
              onCheckedChange={handlePushChange('security')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSavePreferences}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
