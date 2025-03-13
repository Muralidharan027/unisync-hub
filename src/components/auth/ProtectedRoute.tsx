
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
        title: 'Authentication required',
        description: 'Please sign in to access this page',
      });
    }
  }, [loading, user, toast]);

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
  
  // If authenticated but no profile yet, we can still check user_metadata for the role
  const userRole = user.user_metadata?.role as 'student' | 'staff' | 'admin' | undefined;
  
  // If we have a profile, use that. If not, fall back to user_metadata
  const effectiveRole = profile?.role || userRole;
  
  // If authenticated but wrong role, redirect to appropriate dashboard
  if (effectiveRole && effectiveRole !== role) {
    toast({
      title: 'Access denied',
      description: `You are logged in as ${effectiveRole}, not ${role}`,
      variant: 'destructive',
    });
    return <Navigate to={`/${effectiveRole}/dashboard`} replace />;
  }

  // If authenticated and correct role, show the protected content
  return <>{children}</>;
}
