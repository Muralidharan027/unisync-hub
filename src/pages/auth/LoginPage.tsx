
import { useState } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { validateRegisterNumber, validateEmail } from '@/utils/validation';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!identifier || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate identifier based on role
    if (role === 'student') {
      const isEmail = identifier.includes('@');
      
      if (isEmail && !validateEmail(identifier)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!isEmail && !validateRegisterNumber(identifier)) {
        toast({
          title: "Invalid Register Number",
          description: "Register Number must be exactly 13 digits",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    } else {
      // For staff and admin, must be a valid email
      if (!validateEmail(identifier)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive", 
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      console.log("Attempting login with:", identifier, "role:", role);
      await signIn(identifier, password, { role });
    } catch (error) {
      console.error("Login error:", error);
      // Error is already handled in the signIn function
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIdentifierLabel = () => {
    switch (role) {
      case 'student':
        return 'Email / Register Number';
      case 'staff':
      case 'admin':
        return 'College Email Address';
    }
  };

  const getIdentifierPlaceholder = () => {
    switch (role) {
      case 'student':
        return 'Enter your email or 13-digit register number';
      case 'staff':
        return 'staff@college.edu';
      case 'admin':
        return 'admin@college.edu';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to UniSync</CardTitle>
          <CardDescription>
            Enter your credentials to sign in
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">{getIdentifierLabel()}</Label>
              <Input
                id="identifier"
                type="text"
                placeholder={getIdentifierPlaceholder()}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
              {(isSubmitting || loading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-2">
              <p>Don't have an account? <Link to="/auth/signup" className="text-primary hover:underline">Sign up</Link></p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
