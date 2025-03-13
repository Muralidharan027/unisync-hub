
import { useEffect, useState } from "react";
import { Bell, Calendar, FileClock, FileText, Home, Users } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { LeaveRequest } from "@/components/leave/LeaveRequestCard";

export default function StaffDashboard() {
  const [stats, setStats] = useState([
    { title: "Pending Leave Requests", value: "0", icon: <FileClock className="h-4 w-4" /> },
    { title: "Pending OD Requests", value: "0", icon: <FileText className="h-4 w-4" /> },
    { title: "Total Students", value: "45", icon: <Users className="h-4 w-4" /> }, // Static value
    { title: "Upcoming Events", value: "0", icon: <Calendar className="h-4 w-4" /> },
  ]);

  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load leave requests
  useEffect(() => {
    setIsLoading(true);
    
    // In a real app, we would fetch from Supabase
    // For now, we'll use the global store
    if (window.globalLeaveRequests) {
      const pendingReqs = window.globalLeaveRequests.filter(
        req => req.status === "pending"
      ).slice(0, 5);
      
      setPendingRequests(pendingReqs);
      
      // Update stats
      const pendingLeave = window.globalLeaveRequests.filter(
        req => req.status === "pending" && req.type === "leave"
      ).length;
      
      const pendingOD = window.globalLeaveRequests.filter(
        req => req.status === "pending" && req.type === "od"
      ).length;
      
      setStats(prev => [
        { ...prev[0], value: pendingLeave.toString() },
        { ...prev[1], value: pendingOD.toString() },
        { ...prev[2], value: "45" }, // Static value
        { ...prev[3], value: "2" }   // Static value
      ]);
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Subscribe to changes in the global leave requests
  useEffect(() => {
    const checkForUpdates = () => {
      if (window.globalLeaveRequests) {
        const pendingReqs = window.globalLeaveRequests.filter(
          req => req.status === "pending"
        ).slice(0, 5);
        
        setPendingRequests(pendingReqs);
      }
    };
    
    // Check for updates every 2 seconds
    const interval = setInterval(checkForUpdates, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Staff Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/staff/announcements">
                <Bell className="mr-2 h-4 w-4" />
                Announcements
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/staff/leave">
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

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>
              Student leave and OD requests that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[250px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
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
                        {request.studentName} • {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                        {request.type === 'od' && request.periods ? ` • ${request.periods} periods` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline"
                        className={request.type === 'leave' ? 'border-blue-500 text-blue-600' : 'border-purple-500 text-purple-600'}
                      >
                        {request.type === 'leave' ? 'Leave' : 'OD'}
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/staff/leave">
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FileClock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No pending requests to review</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link to="/staff/leave">View All Requests</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
