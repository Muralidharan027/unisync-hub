
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
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  validateEmail, 
  validatePassword, 
  validateRegisterNumber, 
  calculatePasswordStrength,
  validateCollegeDomainEmail
} from '@/utils/validation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [id, setId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const { toast } = useToast();
  const { signUp, validateStudentId, loading } = useAuth();
  const navigate = useNavigate();

  // Calculate password strength whenever password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength('weak');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Form validation
    if (!email || !fullName || (role === 'student' && !id)) {
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

    // Role-specific validation
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
    } else {
      // Email domain validation for staff and admin
      if (!validateCollegeDomainEmail(email)) {
        toast({
          title: "Invalid email domain",
          description: "Staff and admin must use a college domain email",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    // Password validation for all roles
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
        title: "Password too weak",
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

    try {
      console.log("Signing up with:", { email, role, fullName, id });
      // Sign up with the provided information
      await signUp(email, password, role, { fullName, id });
    } catch (error) {
      console.error("Signup error:", error);
      // Error is handled in the signUp function
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthPercentage = () => {
    switch (passwordStrength) {
      case 'weak': return 33;
      case 'medium': return 67;
      case 'strong': return 100;
      default: return 0;
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
              {(role === 'staff' || role === 'admin') && (
                <p className="text-xs text-muted-foreground">
                  Must be a valid college domain email
                </p>
              )}
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
            
            {role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="id">Register Number (13 digits)</Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="Enter your 13-digit Register Number"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your Register Number is used for identification.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Password strength:</span>
                    <span className="font-medium capitalize">{passwordStrength}</span>
                  </div>
                  <Progress value={getStrengthPercentage()} className={getStrengthColor()} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
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
