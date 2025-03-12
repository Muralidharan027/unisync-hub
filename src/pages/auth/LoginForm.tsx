
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

type LoginFormProps = {
  role: 'student' | 'staff' | 'admin';
};

export default function LoginForm({ role }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement actual authentication logic with Supabase
    toast({
      title: "Login Successful",
      description: `Welcome back, ${role}!`,
    });
    
    navigate(`/${role}/dashboard`);
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
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
