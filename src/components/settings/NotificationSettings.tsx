
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type NotificationSettingsProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function NotificationSettings({ role }: NotificationSettingsProps) {
  // Different notification options based on role
  const getNotificationCategories = () => {
    const common = [
      { id: 'emergency', label: 'Emergency Alerts', defaultChecked: true, disabled: true },
      { id: 'events', label: 'Events', defaultChecked: true },
      { id: 'placements', label: 'Placements', defaultChecked: true },
      { id: 'general', label: 'General Updates', defaultChecked: true },
    ];

    if (role === 'student') {
      return [
        ...common,
        { id: 'leave_status', label: 'Leave & OD Request Status Updates', defaultChecked: true },
      ];
    }

    if (role === 'staff') {
      return [
        ...common,
        { id: 'leave_requests', label: 'Leave Request Updates', defaultChecked: true },
        { id: 'od_requests', label: 'OD Acknowledgment Requests', defaultChecked: true },
      ];
    }

    if (role === 'admin') {
      return [
        ...common,
        { id: 'leave_requests', label: 'Leave Request Updates', defaultChecked: true },
        { id: 'od_requests', label: 'OD Request Updates', defaultChecked: true },
        { id: 'user_management', label: 'User Management Updates', defaultChecked: true },
      ];
    }

    return common;
  };

  const [notifications, setNotifications] = useState(() => {
    const categories = getNotificationCategories();
    return Object.fromEntries(categories.map(cat => [cat.id, cat.defaultChecked]));
  });

  const handleToggle = (id: string, checked: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const handleSave = () => {
    // In a real app, you would save this to your backend
    console.log('Saving notification settings:', notifications);
    // Show success toast or message
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your notification preferences to control what you receive.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications from UniSync.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {getNotificationCategories().map((category) => (
            <div className="flex items-center justify-between space-x-2" key={category.id}>
              <Label htmlFor={`notify-${category.id}`} className="flex-1 cursor-pointer">
                {category.label}
                {category.id === 'emergency' && (
                  <span className="block text-xs text-muted-foreground">
                    Emergency alerts cannot be disabled
                  </span>
                )}
              </Label>
              <Switch
                id={`notify-${category.id}`}
                checked={notifications[category.id]}
                onCheckedChange={(checked) => handleToggle(category.id, checked)}
                disabled={category.disabled}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Save Preferences</Button>
    </div>
  );
}
