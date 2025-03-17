
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

type ProtectedRouteProps = {
  children: React.ReactNode;
  role: 'student' | 'staff' | 'admin';
};

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // While checking authentication status, show a loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with toast notification
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please log in to access this page",
      variant: "destructive",
    });
    return <Navigate to={`/auth/${role}/login`} replace />;
  }
  
  // If authenticated but wrong role, redirect to appropriate dashboard with toast notification
  if (profile && profile.role !== role) {
    toast({
      title: "Access Restricted",
      description: `You are logged in as a ${profile.role}, not a ${role}`,
      variant: "destructive",
    });
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  // If authenticated and correct role, show the protected content
  return <>{children}</>;
}
