
import { useParams, Navigate } from 'react-router-dom';
import LoginForm from './LoginForm';

export default function RoleLoginPage() {
  // Get the role from URL parameters
  const { role } = useParams<{ role: string }>();
  
  // Validate that the role is one of the allowed values
  if (role !== 'student' && role !== 'staff' && role !== 'admin') {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <LoginForm role={role} />;
}
