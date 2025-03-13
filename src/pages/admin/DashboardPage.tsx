
import { Bell, Calendar, FileClock, Users } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    { title: "Total Students", value: "0", icon: <Users className="h-4 w-4" /> },
    { title: "Total Staff", value: "0", icon: <Users className="h-4 w-4" /> },
    { title: "Pending Requests", value: "0", icon: <FileClock className="h-4 w-4" /> },
    { title: "Upcoming Events", value: "0", icon: <Calendar className="h-4 w-4" /> },
  ]);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  // Load data from global store if available
  useEffect(() => {
    // Count pending requests
    const pendingCount = window.globalLeaveRequests ? 
      window.globalLeaveRequests.filter(req => req.status === "pending" || req.status === "acknowledged").length : 0;
    
    // Update stats with real data
    setStats(prev => prev.map(stat => 
      stat.title === "Pending Requests" ? { ...stat, value: pendingCount.toString() } : stat
    ));
    
    // Get pending requests
    if (window.globalLeaveRequests) {
      const pendingReqs = window.globalLeaveRequests
        .filter(req => req.status === "pending" || req.status === "acknowledged")
        .slice(0, 3); // Limit to 3 for display
      
      setPendingRequests(pendingReqs);
    }
    
    // Check for global announcements
    if (window.globalAnnouncements) {
      setRecentAnnouncements(window.globalAnnouncements.slice(0, 3));
    }
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/announcements">
                <Bell className="mr-2 h-4 w-4" />
                Announcements
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/leave">
                <FileClock className="mr-2 h-4 w-4" />
                Leave/OD
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Grid of Real-time Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Requests that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="flex items-center justify-between p-3 hover:bg-accent rounded-md border"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {request.reason}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.studentName} • {format(new Date(request.startDate), "MMM dd")} to {format(new Date(request.endDate), "MMM dd")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant="outline"
                          className={request.type === 'leave' ? 'border-blue-500 text-blue-600' : 'border-purple-500 text-purple-600'}
                        >
                          {request.type === 'leave' ? 'Leave' : 'OD'}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={
                            request.status === 'pending' 
                              ? 'border-yellow-500 text-yellow-600' 
                              : 'border-blue-500 text-blue-600'
                          }
                        >
                          {request.status === 'pending' ? 'Pending' : 'Acknowledged'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending requests at this time.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link to="/admin/leave">Process Requests</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                Latest announcements from your institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentAnnouncements.length > 0 ? (
                recentAnnouncements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {announcement.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {announcement.date}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded ${
                      announcement.category === 'important' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : announcement.category === 'emergency'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {announcement.category}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No announcements have been posted yet.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link to="/admin/announcements">Manage Announcements</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
