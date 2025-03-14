import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { GraduationCap, UserCog, Users, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Access course materials and grades',
    icon: GraduationCap,
  },
  {
    id: 'staff',
    title: 'Staff',
    description: 'Manage students and courses',
    icon: Users,
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Control system settings',
    icon: UserCog,
  }
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, validateStudentId } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have stored credentials from signup
    const tempEmail = localStorage.getItem("tempEmail");
    const tempPassword = localStorage.getItem("tempPassword");
    
    if (tempEmail && tempPassword) {
      setEmail(tempEmail);
      setPassword(tempPassword);
    } else {
      // If no stored credentials, user needs to login first
      navigate('/auth/login');
    }
  }, [navigate]);

  const handleContinue = async () => {
    if (!selectedRole) {
      toast({
        title: "Role required",
        description: "Please select a role to continue",
        variant: "destructive",
      });
      return;
    }

    if (selectedRole === 'student' && !studentId) {
      toast({
        title: "Student ID required",
        description: "Please enter your student ID to continue",
        variant: "destructive",
      });
      return;
    }

    if (selectedRole === 'student' && !validateStudentId(studentId)) {
      toast({
        title: "Invalid Student ID",
        description: "The student ID you entered is not valid",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const role = selectedRole as 'student' | 'staff' | 'admin';
      await signUp(email, password, role, studentId);
      
      // Clear temporary storage
      localStorage.removeItem("tempEmail");
      localStorage.removeItem("tempPassword");
      
      // Navigation is handled in the signUp function
    } catch (error: any) {
      console.error("Error during role selection:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to UniSync</CardTitle>
          <CardDescription>Please select your role to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {roles.map((role) => (
              <Button
                key={role.id}
                variant="outline"
                className={`h-auto p-6 flex flex-col items-center gap-4 hover:bg-primary/5 ${
                  selectedRole === role.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="rounded-full bg-primary/10 p-4">
                  <role.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold">{role.title}</h3>
                </div>
              </Button>
            ))}
          </div>

          {selectedRole === 'student' && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your student ID to verify your identity
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleContinue} 
            disabled={isLoading || !selectedRole || (selectedRole === 'student' && !studentId)}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
