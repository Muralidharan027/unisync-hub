
import { Bell, BookOpen, Calendar, FileClock, Home } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  // Mock data for quick statistics
  const stats = [
    { title: "Pending Requests", value: "1", status: "pending", icon: <FileClock className="h-4 w-4" /> },
    { title: "Approved Requests", value: "2", status: "approved", icon: <BookOpen className="h-4 w-4" /> },
    { title: "Recent Announcements", value: "3", icon: <Bell className="h-4 w-4" /> },
    { title: "Events This Week", value: "1", icon: <Calendar className="h-4 w-4" /> },
  ];

  // Mock data for recent activity
  const recentAnnouncements = [
    { 
      id: "1", 
      title: "End Semester Examination Schedule", 
      date: "2 days ago",
      category: "important" 
    },
    { 
      id: "2", 
      title: "Campus Placement Drive", 
      date: "1 week ago",
      category: "placement" 
    },
  ];

  const recentRequests = [
    {
      id: "1",
      type: "od",
      reason: "Hackathon participation",
      status: "pending",
      date: "2023-11-15"
    },
    {
      id: "2",
      type: "leave",
      reason: "Family function",
      status: "approved",
      date: "2023-11-10"
    },
  ];

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
                <div className="text-2xl font-bold">{stat.value}</div>
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
            <CardContent className="space-y-2">
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
                      {announcement.date}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded ${
                    announcement.category === 'important' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {announcement.category}
                  </div>
                </div>
              ))}
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
            <CardContent className="space-y-2">
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
                      {request.type.toUpperCase()} • {request.date}
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
