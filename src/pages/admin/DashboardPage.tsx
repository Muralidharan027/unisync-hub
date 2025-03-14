import { Bell, Calendar, FileClock, Users } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";
import { getAnnouncements } from "@/store/announcements";
import { getLeaveRequests } from "@/store/leaveRequests";
import { useAuth } from "@/hooks/useAuth";
import { Announcement } from "@/components/announcements/AnnouncementCard";

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState([
    { title: "Total Students", value: "0", icon: <Users className="h-4 w-4" /> },
    { title: "Total Staff", value: "0", icon: <Users className="h-4 w-4" /> },
    { title: "Pending Requests", value: "0", icon: <FileClock className="h-4 w-4" /> },
    { title: "Total Announcements", value: "0", icon: <Bell className="h-4 w-4" /> },
  ]);

  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to count unique student emails
  const countUniqueStudents = () => {
    const requests = getLeaveRequests();
    const uniqueStudentEmails = new Set();
    
    requests.forEach(req => {
      if ((req as any).studentEmail) {
        uniqueStudentEmails.add((req as any).studentEmail);
      }
    });
    
    return uniqueStudentEmails.size > 0 ? uniqueStudentEmails.size : 12; // Fallback to 12 if no real data
  };

  // Function to count unique staff emails (creators of announcements)
  const countUniqueStaff = () => {
    const announcements = getAnnouncements();
    const uniqueStaffEmails = new Set();
    
    announcements.forEach(ann => {
      if ((ann as any).authorEmail && (ann as any).authorEmail !== profile?.email) {
        uniqueStaffEmails.add((ann as any).authorEmail);
      }
    });
    
    return uniqueStaffEmails.size > 0 ? uniqueStaffEmails.size : 5; // Fallback to 5 if no real data
  };

  useEffect(() => {
    setIsLoading(true);
    
    // For the purpose of demo, use timeouts to simulate loading
    setTimeout(() => {
      const leaveRequests = getLeaveRequests();
      // Calculate stats
      const pendingCount = leaveRequests.filter(req => 
        req.status === "pending" || req.status === "acknowledged"
      ).length;
      
      const announcements = getAnnouncements();
      const totalStudents = countUniqueStudents();
      const totalStaff = countUniqueStaff();
      
      setStats([
        { title: "Total Students", value: totalStudents.toString(), icon: <Users className="h-4 w-4" /> },
        { title: "Total Staff", value: totalStaff.toString(), icon: <Users className="h-4 w-4" /> },
        { title: "Pending Requests", value: pendingCount.toString(), icon: <FileClock className="h-4 w-4" /> },
        { title: "Total Announcements", value: announcements.length.toString(), icon: <Bell className="h-4 w-4" /> },
      ]);
      
      // Get pending requests
      const pendingReqs = leaveRequests
        .filter(req => req.status === "pending" || req.status === "acknowledged")
        .slice(0, 3);
      
      setPendingRequests(pendingReqs);
      
      // Get recent announcements
      setRecentAnnouncements(announcements.slice(0, 3));
      
      setIsLoading(false);
    }, 1000);
  }, [profile?.email]);
  
  // Subscribe to updates
  useEffect(() => {
    const interval = setInterval(() => {
      const leaveRequests = getLeaveRequests();
      // Update stats for real-time changes
      const pendingCount = leaveRequests.filter(req => 
        req.status === "pending" || req.status === "acknowledged"
      ).length;
      
      const announcements = getAnnouncements();
      const totalStudents = countUniqueStudents();
      const totalStaff = countUniqueStaff();
      
      setStats(prev => [
        { ...prev[0], value: totalStudents.toString() }, 
        { ...prev[1], value: totalStaff.toString() },
        { ...prev[2], value: pendingCount.toString() },
        { ...prev[3], value: announcements.length.toString() }
      ]);
      
      // Update pending requests
      const pendingReqs = leaveRequests
        .filter(req => req.status === "pending" || req.status === "acknowledged")
        .slice(0, 3);
      
      setPendingRequests(pendingReqs);
      
      // Update recent announcements
      setRecentAnnouncements(announcements.slice(0, 3));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [profile?.email]);

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
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Requests that need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : pendingRequests.length > 0 ? (
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                Latest announcements from your institution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : recentAnnouncements.length > 0 ? (
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
                        {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <Badge className={getCategoryColor(announcement.category)}>
                      {getCategoryName(announcement.category)}
                    </Badge>
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

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'emergency':
      return 'bg-red-500 hover:bg-red-600';
    case 'important':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'placement':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'event':
      return 'bg-purple-500 hover:bg-purple-600';
    case 'general':
    default:
      return 'bg-green-500 hover:bg-green-600';
  }
};

const getCategoryName = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const formatDistanceToNow = (date: Date, options: any) => {
  return format(date, 'MMM dd, yyyy');
};
