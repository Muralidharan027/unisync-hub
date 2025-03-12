import { Bell, Calendar, FileClock, FileText, Home, Users } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function StaffDashboard() {
  // Mock data for quick statistics
  const stats = [
    { title: "Pending Leave Requests", value: "3", icon: <FileClock className="h-4 w-4" /> },
    { title: "Pending OD Requests", value: "2", icon: <FileText className="h-4 w-4" /> },
    { title: "Total Students", value: "45", icon: <Users className="h-4 w-4" /> },
    { title: "Upcoming Events", value: "2", icon: <Calendar className="h-4 w-4" /> },
  ];

  // Mock data for pending requests
  const pendingRequests = [
    {
      id: "1",
      type: "leave",
      reason: "Family function",
      studentName: "John Doe",
      date: "2023-11-20 to 2023-11-22"
    },
    {
      id: "2",
      type: "od",
      reason: "Hackathon participation",
      studentName: "Jane Smith",
      date: "2023-12-01 to 2023-12-03"
    },
    {
      id: "3",
      type: "leave",
      reason: "Medical leave",
      studentName: "Robert Johnson",
      date: "2023-11-05 to 2023-11-07"
    },
  ];

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
                <div className="text-2xl font-bold">{stat.value}</div>
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
          <CardContent>
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
                      {request.studentName} • {request.date}
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
