
import { ReactNode } from 'react';
import { Bell, Home, LogOut, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'staff' | 'admin';
}

// Helper function to get role display text
const getRoleDisplayText = (role: 'student' | 'staff' | 'admin') => {
  switch(role) {
    case 'student':
      return 'Student';
    case 'staff':
      return 'Staff Member';
    case 'admin':
      return 'Administrator';
    default:
      return 'User';
  }
};

// Helper function to get role badge color
const getRoleBadgeColor = (role: 'student' | 'staff' | 'admin') => {
  switch(role) {
    case 'student':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'staff':
      return 'bg-green-500 hover:bg-green-600';
    case 'admin':
      return 'bg-purple-500 hover:bg-purple-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/auth/login');
  };

  return (
    <ProtectedRoute role={role}>
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center px-4">
            <Link to={`/${role}/dashboard`} className="font-semibold text-lg">
              UniSync
            </Link>
            
            <Badge className={`ml-3 ${getRoleBadgeColor(role)}`}>
              {getRoleDisplayText(role)}
            </Badge>
            
            {/* Universal Home Button - More prominent */}
            <Button 
              variant="default" 
              size="sm" 
              className="ml-4" 
              asChild
            >
              <Link to={`/${role}/dashboard`}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
            
            <div className="ml-auto flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/${role}/announcements`}>
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {profile?.full_name || 'User Profile'}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {profile?.email || 'Loading...'}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${role}/settings/profile`}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/${role}/settings/appearance`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <main className="flex-1 overflow-y-auto">
            <div className="container py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
