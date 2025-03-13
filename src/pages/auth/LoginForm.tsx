
import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';

type LoginFormProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signIn, loading, user, profile } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in and has a profile, redirect to their dashboard
  useEffect(() => {
    if (user && profile) {
      navigate(`/${profile.role}/dashboard`, { replace: true });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !id) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signIn(email, id, role);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000); // Ensure button isn't stuck in loading state
    }
  };

  const getIdLabel = () => {
    switch (role) {
      case 'student':
        return 'Student ID';
      case 'staff':
        return 'Staff ID';
      case 'admin':
        return 'Admin Code';
    }
  };

  // If overall authentication loading is complete and we have a user and profile, redirect
  if (!loading && user && profile) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to login as {role}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id">{getIdLabel()}</Label>
              <Input
                id="id"
                type="text"
                placeholder="Enter your ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
