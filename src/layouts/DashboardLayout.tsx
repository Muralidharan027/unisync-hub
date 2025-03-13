
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

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'student' | 'staff' | 'admin';
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <ProtectedRoute role={role}>
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center px-4">
            <Link to={`/${role}/dashboard`} className="font-semibold text-lg">
              UniSync
            </Link>
            <div className="ml-auto flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to={`/${role}/dashboard`}>
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Home</span>
                </Link>
              </Button>
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
