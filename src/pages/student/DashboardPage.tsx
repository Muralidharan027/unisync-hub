import { useEffect, useState } from "react";
import { Bell, BookOpen, Calendar, FileClock, Home } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { Announcement } from "@/components/announcements/AnnouncementCard";
import { supabase } from "@/integrations/supabase/client";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState([
    { title: "Pending Requests", value: "0", status: "pending", icon: <FileClock className="h-4 w-4" /> },
    { title: "Approved Requests", value: "0", status: "approved", icon: <BookOpen className="h-4 w-4" /> },
    { title: "Recent Announcements", value: "0", icon: <Bell className="h-4 w-4" /> },
    { title: "Events This Week", value: "0", icon: <Calendar className="h-4 w-4" /> },
  ]);
  
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real-time data
  useEffect(() => {
    setIsLoading(true);
    
    // Load leave requests from window.globalLeaveRequests (our mock global store)
    if (profile && window.globalLeaveRequests) {
      const studentRequests = window.globalLeaveRequests.filter(
        req => req.studentId === profile.student_id
      );
      
      setRecentRequests(studentRequests.slice(0, 3));
      
      // Update stats based on real data
      const pendingCount = studentRequests.filter(req => req.status === "pending").length;
      const approvedCount = studentRequests.filter(req => req.status === "approved").length;
      
      setStats(prev => [
        { ...prev[0], value: pendingCount.toString() },
        { ...prev[1], value: approvedCount.toString() },
        { ...prev[2], value: "0" }, // Will be updated when we fetch announcements
        { ...prev[3], value: "0" }
      ]);
    }
    
    // Simulating announcements fetch (would be from Supabase in real app)
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [profile]);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/student/announcements">
                <Bell className="mr-2 h-4 w-4" />
                Announcements
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/student/leave">
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
                <div className="text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                Latest announcements from your institution
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : recentAnnouncements.length > 0 ? (
                <div className="space-y-2">
                  {recentAnnouncements.map((announcement) => (
                    <div 
                      key={announcement.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {announcement.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded bg-blue-100 text-blue-800`}>
                        {announcement.category}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No announcements yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link to="/student/announcements">View All Announcements</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Your recent leave and OD requests
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[200px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : recentRequests.length > 0 ? (
                <div className="space-y-2">
                  {recentRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {request.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.type.toUpperCase()} • {new Date(request.startDate).toLocaleDateString()}
                          {request.type === 'od' && request.periods ? ` • ${request.periods} periods` : ''}
                        </p>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded ${
                        request.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <FileClock className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No requests submitted yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link to="/student/leave">Manage Requests</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
