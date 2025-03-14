import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface ActivityEvent {
  id: string;
  type: "login" | "profile" | "announcement" | "leave" | "other";
  description: string;
  timestamp: Date;
}

interface ActivitySettingsProps {
  role?: 'student' | 'staff' | 'admin';
}

export default function ActivitySettings({ role }: ActivitySettingsProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    const loadActivityLog = () => {
      const savedActivities = localStorage.getItem(`activityLog_${user?.email}`);
      
      if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities);
        // Convert string dates to Date objects
        setActivities(parsedActivities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        })));
      } else {
        // Create initial activity events if none exist
        const initialActivities: ActivityEvent[] = [
          {
            id: Math.random().toString(36).substring(2),
            type: "login",
            description: "Logged in successfully",
            timestamp: new Date()
          }
        ];
        
        // Add role-specific initial activities
        if (role === 'staff' || role === 'admin') {
          initialActivities.push({
            id: Math.random().toString(36).substring(2),
            type: "announcement",
            description: "Created a new announcement",
            timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          });
        }
        
        if (role === 'student') {
          initialActivities.push({
            id: Math.random().toString(36).substring(2),
            type: "leave",
            description: "Submitted leave request",
            timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
          });
        }
        
        // Add profile update for all roles
        initialActivities.push({
          id: Math.random().toString(36).substring(2),
          type: "profile",
          description: "Updated profile information",
          timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
        });
        
        setActivities(initialActivities);
        localStorage.setItem(`activityLog_${user?.email}`, JSON.stringify(initialActivities));
      }
    };

    if (user) {
      loadActivityLog();
    }
  }, [user, role]);

  const filteredActivities = filterType === "all" 
    ? activities 
    : activities.filter(activity => activity.type === filterType);

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case "login":
        return "bg-blue-100 text-blue-800";
      case "profile":
        return "bg-green-100 text-green-800";
      case "announcement":
        return "bg-purple-100 text-purple-800";
      case "leave":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Recent actions and changes for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setFilterType}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Activity</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              {(role === 'staff' || role === 'admin') && (
                <TabsTrigger value="announcement">Announcements</TabsTrigger>
              )}
              <TabsTrigger value="leave">Leave Requests</TabsTrigger>
            </TabsList>
            <TabsContent value={filterType}>
              <ScrollArea className="h-[400px] rounded-md border">
                <div className="p-4 space-y-4">
                  {filteredActivities.length > 0 ? (
                    filteredActivities
                      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                      .map(activity => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-md">
                          <Badge className={`${getActivityBadgeColor(activity.type)} capitalize`}>
                            {activity.type}
                          </Badge>
                          <div className="space-y-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(activity.timestamp, "PPP 'at' p")}
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">No activities found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
