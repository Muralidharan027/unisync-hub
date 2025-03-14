
import { useParams, Navigate } from 'react-router-dom';
import LoginForm from './LoginForm';

export default function RoleLoginPage() {
  // Get the role from URL parameters
  const { role } = useParams<{ role: string }>();
  
  // Validate that the role is one of the allowed values
  if (role !== 'student' && role !== 'staff' && role !== 'admin') {
    return <Navigate to="/auth/login" replace />;
  }
  
  // Message for students about register number
  const studentMessage = role === 'student' 
    ? "Use your 13-digit College Register Number as your password" 
    : "";
  
  return (
    <>
      {role === 'student' && (
        <div className="text-center mb-4 bg-blue-50 p-3 rounded-md text-blue-800 max-w-md mx-auto">
          <p className="font-medium">Student Login</p>
          <p className="text-sm">Please use your 13-digit College Register Number as your password</p>
        </div>
      )}
      <LoginForm role={role} />
    </>
  );
}
