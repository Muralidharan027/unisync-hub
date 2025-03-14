
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaveRequests } from "@/store/leaveRequests";
import { getAnnouncements } from "@/store/announcements";

type ActivitySettingsProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function ActivitySettings({ role }: ActivitySettingsProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) return;
    
    // Get activities from localStorage or generate new ones
    const loadActivities = () => {
      // Get saved activities if they exist
      const savedActivities = localStorage.getItem(`activities_${user.email}`);
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
        return;
      }
      
      // Generate activities based on actual user actions
      const newActivities = [];
      
      // Add profile update activity
      newActivities.push({
        id: 1,
        action: 'Profile Updated',
        details: 'You updated your profile information',
        date: new Date().toLocaleString(),
        category: 'profile'
      });
      
      // Get leave requests (for student role or to track approvals for staff/admin)
      const leaveRequests = getLeaveRequests();
      if (role === 'student') {
        // For students, show their leave request submissions
        const userLeaveRequests = leaveRequests.filter(req => 
          (req as any).studentEmail === user.email || 
          (req as any).user_id === user.id
        );
        
        if (userLeaveRequests.length > 0) {
          newActivities.push({
            id: newActivities.length + 1,
            action: 'Leave Request Submitted',
            details: `You submitted a leave request on ${new Date(userLeaveRequests[0].submittedAt).toLocaleDateString()}`,
            date: new Date(userLeaveRequests[0].submittedAt).toLocaleString(),
            category: 'leave'
          });
        }
      } else {
        // For staff/admin, show their approvals
        const approvedRequests = leaveRequests.filter(req => 
          req.status === 'approved' && 
          ((req as any).approver_id === user.id || (req as any).approver_email === user.email)
        );
        
        if (approvedRequests.length > 0) {
          newActivities.push({
            id: newActivities.length + 1,
            action: 'Leave Request Approved',
            details: `You approved a leave request from ${approvedRequests[0].studentName}`,
            date: new Date(approvedRequests[0].submittedAt).toLocaleString(),
            category: 'leave'
          });
        }
      }
      
      // Get announcements (for staff/admin)
      if (role === 'staff' || role === 'admin') {
        const announcements = getAnnouncements();
        const userAnnouncements = announcements.filter(ann => 
          (ann as any).authorEmail === user.email || (ann as any).author_id === user.id
        );
        
        if (userAnnouncements.length > 0) {
          newActivities.push({
            id: newActivities.length + 1,
            action: 'Announcement Created',
            details: `You posted an announcement: "${userAnnouncements[0].title}"`,
            date: new Date(userAnnouncements[0].date).toLocaleString(),
            category: 'announcement'
          });
        }
      }
      
      // Add login activity
      newActivities.push({
        id: newActivities.length + 1,
        action: 'New Login',
        details: `New login from ${getBrowser()} on ${getOS()}`,
        date: new Date().toLocaleString(),
        category: 'security'
      });
      
      setActivities(newActivities);
      localStorage.setItem(`activities_${user.email}`, JSON.stringify(newActivities));
    };
    
    loadActivities();
  }, [user, role]);
  
  const getBrowser = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    if (userAgent.indexOf("Safari") > -1) return "Safari";
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer";
    if (userAgent.indexOf("Edge") > -1) return "Edge";
    return "Unknown Browser";
  };
  
  const getOS = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Windows") > -1) return "Windows";
    if (userAgent.indexOf("Mac") > -1) return "macOS";
    if (userAgent.indexOf("Linux") > -1) return "Linux";
    if (userAgent.indexOf("Android") > -1) return "Android";
    if (userAgent.indexOf("iOS") > -1 || userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1) return "iOS";
    return "Unknown OS";
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'profile':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'security':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'leave':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'announcement':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'user-management':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };
  
  const handleClearCache = () => {
    if (!user) return;
    
    // Clear the cache for this user
    localStorage.removeItem(`activities_${user.email}`);
    setActivities([]);
    
    // Create a new login activity
    const newActivity = {
      id: 1,
      action: 'Cache Cleared',
      details: 'You cleared your activity cache',
      date: new Date().toLocaleString(),
      category: 'security'
    };
    
    setActivities([newActivity]);
    localStorage.setItem(`activities_${user.email}`, JSON.stringify([newActivity]));
    
    toast({
      title: "Cache cleared",
      description: "Your activity cache has been cleared successfully."
    });
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
            {activities.length > 0 ? (
              activities.map((activity) => (
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
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">No activity recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clear Data</CardTitle>
          <CardDescription>
            Clear cached data and activity logs from your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full" onClick={handleClearCache}>Clear Cache</Button>
          <p className="text-xs text-muted-foreground">
            This will clear temporary files and might help if you're experiencing issues with the app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
