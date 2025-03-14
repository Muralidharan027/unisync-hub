
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
import { Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateEmail } from '@/utils/validation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword, loading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error: any) {
      // Error is handled in the resetPassword function
      console.error("Password reset error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Your Password?</CardTitle>
          <CardDescription>
            Don't worry, we've got you covered!
          </CardDescription>
        </CardHeader>
        
        {emailSent ? (
          <CardContent className="space-y-4 text-center">
            <div className="mx-auto bg-green-50 dark:bg-green-900/20 rounded-full p-3 w-16 h-16 flex items-center justify-center my-4">
              <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold">Check your email</h3>
            <p className="text-muted-foreground">
              We've sent a password reset link to {email}
            </p>
            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
              <p className="font-medium mb-2">Didn't receive an email?</p>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Check your spam folder</li>
                <li>Make sure you entered the correct email</li>
                <li>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={handleSubmit}
                    disabled={isSubmitting || loading}
                  >
                    Click here to try again
                  </Button>
                </li>
              </ul>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || loading}
              >
                {(isSubmitting || loading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Remembered your password?{" "}
                  <Link to="/auth/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
