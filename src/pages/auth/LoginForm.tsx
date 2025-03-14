
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
import { Loader2 } from 'lucide-react';

type LoginFormProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock credentials validation
    if (!email || !id) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Pass the role to signIn function for role-specific authentication
      await signIn(email, id, role);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
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
  
  // Set default email based on role
  const getDefaultEmail = () => {
    switch (role) {
      case 'student':
        return 'student@example.com';
      case 'staff':
        return 'staff@example.com';
      case 'admin':
        return 'admin@example.com';
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={getDefaultEmail()}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                For demo: use {getDefaultEmail()}
              </p>
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
              />
              <p className="text-xs text-muted-foreground">
                For demo: use any password
              </p>
            </div>
          </CardContent>
          <CardFooter>
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
