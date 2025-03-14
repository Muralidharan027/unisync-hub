
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function RoleSelection() {
  const { user, profile, signIn, loading } = useAuth();
  const [processingRole, setProcessingRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user is already logged in with a profile, redirect to their dashboard
  if (user && profile) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  // Handler for selecting a role
  const handleRoleSelect = async (role: 'student' | 'staff' | 'admin') => {
    setProcessingRole(role);
    
    try {
      // Check if we have temporary credentials from sign up
      const tempEmail = localStorage.getItem("tempEmail");
      const tempPassword = localStorage.getItem("tempPassword");
      
      if (tempEmail && tempPassword) {
        // After role selection, move to registration completion
        navigate(`/auth/${role}/register`, { 
          state: { email: tempEmail, password: tempPassword } 
        });
        
        // Clear temporary credentials
        localStorage.removeItem("tempEmail");
        localStorage.removeItem("tempPassword");
      } else {
        // If we have a user but no profile, likely coming from login
        navigate(`/auth/${role}/login`);
      }
    } catch (error) {
      console.error("Role selection error:", error);
      toast({
        title: "Error",
        description: "Failed to process your selection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingRole(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to UniSync</CardTitle>
          <CardDescription className="text-lg">
            Please select your role to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <RoleCard
            title="Student"
            description="Access your courses, assignments, and grades"
            onClick={() => handleRoleSelect('student')}
            isLoading={processingRole === 'student'}
          />
          <RoleCard
            title="Staff"
            description="Manage courses, students, and teaching resources"
            onClick={() => handleRoleSelect('staff')}
            isLoading={processingRole === 'staff'}
          />
          <RoleCard
            title="Admin"
            description="System administration and university management"
            onClick={() => handleRoleSelect('admin')}
            isLoading={processingRole === 'admin'}
          />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p>Select the role that best describes your position at the university.</p>
        </CardFooter>
      </Card>
    </div>
  );
}

interface RoleCardProps {
  title: string;
  description: string;
  onClick: () => void;
  isLoading: boolean;
}

function RoleCard({ title, description, onClick, isLoading }: RoleCardProps) {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
      <CardHeader className="relative">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="relative">
        <Button 
          onClick={onClick} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Processing...
            </>
          ) : (
            `Continue as ${title}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
