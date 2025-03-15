
import { useState } from 'react';
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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { validateRegisterNumber, validateEmail, validateCollegeDomainEmail } from '@/utils/validation';
import { Link } from 'react-router-dom';
import { Checkbox } from "@/components/ui/checkbox";

type LoginFormProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function LoginForm({ role }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Form validation
    if (!identifier || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // For students, validate based on whether it looks like an email or register number
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
      // For staff and admin, must be a valid college email
      if (!validateCollegeDomainEmail(identifier)) {
        toast({
          title: "Invalid College Email",
          description: "Please enter a valid college domain email (e.g., name@gurunanakcollege.edu.in)",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Call signIn with role-specific data
      await signIn(identifier, password, { role });
    } catch (error: any) {
      console.error("Login error:", error);
      // Error handling is done in the signIn function
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
        return 'name@gurunanakcollege.edu.in';
      case 'admin':
        return 'name@gurunanakcollege.edu.in';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to UniSync</CardTitle>
          <CardDescription>
            Enter your credentials to login as {role}
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
              {role === 'staff' || role === 'admin' ? (
                <p className="text-xs text-gray-500">Must use a college domain email address (e.g., name@gurunanakcollege.edu.in)</p>
              ) : null}
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
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isSubmitting || loading}>
              {(isSubmitting || loading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <div className="mt-4 text-center text-sm space-y-2">
              <Link to="/auth/login" className="text-blue-500 hover:underline block">
                Switch to another role
              </Link>
              <Link to="/auth/signup" className="text-primary hover:underline block">
                Don't have an account? Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
