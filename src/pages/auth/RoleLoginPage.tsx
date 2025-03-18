
import { useParams, Navigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function RoleLoginPage() {
  // Get the role from URL parameters
  const { role } = useParams<{ role: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showHint, setShowHint] = useState<boolean>(false);
  
  useEffect(() => {
    // Show test account hint after a short delay
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Validate that the role is one of the allowed values
  if (role !== 'student' && role !== 'staff' && role !== 'admin') {
    return <Navigate to="/auth/login" replace />;
  }
  
  // If user is authenticated, redirect to appropriate dashboard
  if (user) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  
  return (
    <>
      {role === 'student' && (
        <div className="text-center mb-4 bg-blue-50 p-3 rounded-md text-blue-800 max-w-md mx-auto">
          <p className="font-medium">Student Login</p>
          <p className="text-sm">You can log in with your 13-digit Register Number or Email</p>
          {showHint && (
            <div className="mt-2 p-2 bg-blue-100 rounded-md text-xs">
              <p className="font-medium">Test Account</p>
              <p>Email: student@example.com</p>
              <p>Password: password123</p>
            </div>
          )}
        </div>
      )}
      {role === 'staff' && (
        <div className="text-center mb-4 bg-blue-50 p-3 rounded-md text-blue-800 max-w-md mx-auto">
          <p className="font-medium">Staff Login</p>
          <p className="text-sm">Please use your college email address (e.g., name@gurunanakcollege.edu.in)</p>
          {showHint && (
            <div className="mt-2 p-2 bg-blue-100 rounded-md text-xs">
              <p className="font-medium">Test Account</p>
              <p>Email: staff@example.com</p>
              <p>Password: password123</p>
            </div>
          )}
        </div>
      )}
      {role === 'admin' && (
        <div className="text-center mb-4 bg-blue-50 p-3 rounded-md text-blue-800 max-w-md mx-auto">
          <p className="font-medium">Admin Login</p>
          <p className="text-sm">Please use your college email address (e.g., admin@gurunanakcollege.edu.in)</p>
          {showHint && (
            <div className="mt-2 p-2 bg-blue-100 rounded-md text-xs">
              <p className="font-medium">Test Account</p>
              <p>Email: admin@example.com</p>
              <p>Password: password123</p>
            </div>
          )}
        </div>
      )}
      <LoginForm role={role} />
    </>
  );
}
