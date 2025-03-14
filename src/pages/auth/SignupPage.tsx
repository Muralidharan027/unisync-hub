
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, UserPlus } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { validateEmail, validatePassword, validateRegisterNumber } from '@/utils/validation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [id, setId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signUp, validateStudentId, loading } = useAuth();
  const navigate = useNavigate();

  // For student role, use register number as password
  useEffect(() => {
    if (role === 'student' && id) {
      setPassword(id);
      setConfirmPassword(id);
    }
  }, [role, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Form validation
    if (!email || !fullName || !id) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Student-specific validation
    if (role === 'student') {
      if (!validateRegisterNumber(id)) {
        toast({
          title: "Invalid Register Number",
          description: "Register Number must be exactly 13 digits",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // For students, use the register number as the password
      setPassword(id);
      setConfirmPassword(id);
    } else {
      // Password validation for non-student roles
      if (!password || !confirmPassword) {
        toast({
          title: "Missing password",
          description: "Please enter and confirm your password",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!validatePassword(password)) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Passwords do not match",
          description: "Please ensure both passwords match",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Role-specific validation
    if (role === 'student' && !validateStudentId(id)) {
      toast({
        title: "Invalid Student ID",
        description: "Please enter a valid student ID. Valid IDs: 60821-60830",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // For students, the password is the same as the register number
      const finalPassword = role === 'student' ? id : password;
      await signUp(email, finalPassword, role, { fullName, id });
    } catch (error) {
      console.error("Signup error:", error);
      // Error is handled in the signUp function
      setIsSubmitting(false);
    }
  };

  const getIdLabel = () => {
    switch (role) {
      case 'student':
        return 'Register Number (13 digits)';
      case 'staff':
        return 'Staff ID';
      case 'admin':
        return 'Admin Code';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Enter your details to create your UniSync account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={role} 
                onValueChange={(value) => setRole(value as 'student' | 'staff' | 'admin')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id">{getIdLabel()}</Label>
              <Input
                id="id"
                type="text"
                placeholder={role === 'student' ? "Enter your 13-digit Register Number" : `Enter your ${role} ID`}
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
              {role === 'student' && (
                <p className="text-xs text-muted-foreground">
                  Your Register Number will also be used as your password. Valid student IDs: 60821-60830
                </p>
              )}
            </div>
            
            {role !== 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
              {(isSubmitting || loading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-2">
              <p>Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Sign in</Link></p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
