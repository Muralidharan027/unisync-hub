
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ActivitySettingsProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function ActivitySettings({ role }: ActivitySettingsProps) {
  // This would come from backend in a real app
  const activities = [
    { 
      id: 1, 
      action: 'Profile Updated', 
      details: 'You updated your profile information', 
      date: 'Today, 10:30 AM', 
      category: 'profile' 
    },
    { 
      id: 2, 
      action: 'Password Changed', 
      details: 'You changed your account password', 
      date: 'Yesterday, 2:15 PM', 
      category: 'security' 
    },
    { 
      id: 3, 
      action: role === 'student' ? 'Leave Request Submitted' : 'Leave Request Approved', 
      details: role === 'student' ? 'You submitted a leave request' : 'You approved a leave request from John Doe', 
      date: '3 days ago', 
      category: 'leave' 
    },
    { 
      id: 4, 
      action: 'Notification Settings Updated', 
      details: 'You updated your notification preferences', 
      date: '1 week ago', 
      category: 'notifications' 
    },
    { 
      id: 5, 
      action: 'New Login', 
      details: 'New login from Chrome on Windows', 
      date: '1 week ago', 
      category: 'security' 
    },
  ];

  // Add admin-specific activities
  if (role === 'admin') {
    activities.push({ 
      id: 6, 
      action: 'User Created', 
      details: 'You created a new staff account for Jane Smith', 
      date: '2 weeks ago', 
      category: 'user-management' 
    });
  }

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'profile':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'security':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'leave':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'notifications':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'user-management':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Activity Log</h3>
        <p className="text-sm text-muted-foreground">
          View your recent activities and account changes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            A log of actions performed on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(activity.category)}`}
                    >
                      {activity.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm">Load More</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clear Data</CardTitle>
          <CardDescription>
            Clear cached data and activity logs from your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full">Clear Cache</Button>
          <p className="text-xs text-muted-foreground">
            This will clear temporary files and might help if you're experiencing issues with the app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
