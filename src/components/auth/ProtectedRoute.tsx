
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  role: 'student' | 'staff' | 'admin';
};

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: `Please log in to access the ${role} dashboard.`,
        variant: "destructive",
      });
    } else if (!loading && profile && profile.role !== role) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to access the ${role} dashboard.`,
        variant: "destructive",
      });
    }
  }, [loading, user, profile, role, toast]);

  // While checking authentication status, show a loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={`/auth/${role}/login`} replace />;
  }
  
  // If authenticated but wrong role, redirect to appropriate dashboard
  if (profile && profile.role !== role) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  // If authenticated and correct role, show the protected content
  return <>{children}</>;
}
