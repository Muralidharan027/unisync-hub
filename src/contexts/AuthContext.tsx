
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock user data for different roles
const MOCK_USERS = {
  student: {
    id: "student-123",
    email: "student@example.com",
    profile: {
      id: "student-123",
      role: "student" as UserRole,
      full_name: "Student User",
      email: "student@example.com",
      student_id: "STU001",
      phone: null,
      avatar_url: null,
    }
  },
  staff: {
    id: "staff-123",
    email: "staff@example.com",
    profile: {
      id: "staff-123",
      role: "staff" as UserRole,
      full_name: "Staff User",
      email: "staff@example.com",
      staff_id: "STA001",
      phone: null,
      avatar_url: null,
    }
  },
  admin: {
    id: "admin-123",
    email: "admin@example.com",
    profile: {
      id: "admin-123",
      role: "admin" as UserRole,
      full_name: "Admin User",
      email: "admin@example.com",
      admin_id: "ADM001",
      phone: null,
      avatar_url: null,
    }
  }
};

// Types
type UserRole = "student" | "staff" | "admin";
type User = { id: string; email: string; };
type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  student_id?: string;
  staff_id?: string;
  admin_id?: string;
  phone?: string | null;
  avatar_url?: string | null;
};

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, id: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check localStorage for a saved role
        const savedRole = localStorage.getItem("userRole") as UserRole | null;
        
        if (savedRole && MOCK_USERS[savedRole]) {
          setUser(MOCK_USERS[savedRole]);
          setProfile(MOCK_USERS[savedRole].profile);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Sign in function
  const signIn = async (email: string, id: string, role: UserRole) => {
    try {
      setLoading(true);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock user based on role
      if (MOCK_USERS[role]) {
        setUser(MOCK_USERS[role]);
        setProfile(MOCK_USERS[role].profile);
        
        // Save role to localStorage
        localStorage.setItem("userRole", role);
        
        // Navigate to the dashboard
        navigate(`/${role}/dashboard`);
        
        toast({
          title: "Sign in successful",
          description: `Welcome back, ${MOCK_USERS[role].profile.full_name}!`,
        });
      } else {
        throw new Error("Invalid role");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear state and localStorage
      setUser(null);
      setProfile(null);
      localStorage.removeItem("userRole");
      
      // Navigate to root
      navigate("/");
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
