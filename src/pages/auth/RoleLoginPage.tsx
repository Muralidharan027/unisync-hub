
import { useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginForm from './LoginForm';
import { toast } from '@/hooks/use-toast';

export default function RoleLoginPage() {
  // Get the role from URL parameters
  const { role } = useParams<{ role: string }>();
  
  // Validate that the role is one of the allowed values
  if (role !== 'student' && role !== 'staff' && role !== 'admin') {
    return <Navigate to="/auth/login" replace />;
  }
  
  // On development mode, show login credentials in toast
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      let loginInfo = '';
      
      if (role === 'student') {
        loginInfo = 'student@example.com / password123';
      } else if (role === 'staff') {
        loginInfo = 'staff@gurunanakcollege.edu.in / password123';
      } else if (role === 'admin') {
        loginInfo = 'admin@gurunanakcollege.edu.in / password123';
      }
      
      toast({
        title: `${role.charAt(0).toUpperCase() + role.slice(1)} Login`,
        description: `For testing, use: ${loginInfo}`,
        duration: 8000,
      });
    }
  }, [role]);
  
  return (
    <>
      {role === 'student' && (
        <div className="text-center mb-4 bg-blue-50 p-3 rounded-md text-blue-800 max-w-md mx-auto">
          <p className="font-medium">Student Login</p>
          <p className="text-sm">You can log in with your 13-digit Register Number or Email</p>
        </div>
      )}
      {(role === 'staff' || role === 'admin') && (
        <div className="text-center mb-4 bg-blue-50 p-3 rounded-md text-blue-800 max-w-md mx-auto">
          <p className="font-medium">{role === 'staff' ? 'Staff' : 'Admin'} Login</p>
          <p className="text-sm">Please use your college email address (e.g., name@gurunanakcollege.edu.in)</p>
        </div>
      )}
      <LoginForm role={role} />
    </>
  );
}
