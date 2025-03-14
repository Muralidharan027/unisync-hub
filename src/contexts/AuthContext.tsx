import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

// Valid student IDs
export const VALID_STUDENT_IDS = [
  "60821", "60822", "60823", "60824", "60825", 
  "60826", "60827", "60828", "60829", "60830"
];

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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, studentId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  validateStudentId: (studentId: string) => boolean;
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
        // Check localStorage for a saved session
        const savedEmail = localStorage.getItem("userEmail");
        const savedRole = localStorage.getItem("userRole") as UserRole | null;
        
        if (savedEmail && savedRole && MOCK_USERS[savedRole]) {
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
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would call supabase.auth.signInWithPassword here
      // For now, we'll simulate successful login if the password is not empty
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Store email for the role selection page
      localStorage.setItem("userEmail", email);
      
      // Navigate to role selection
      navigate('/');
      
      toast({
        title: "Sign in successful",
        description: "Please select your role to continue.",
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, role: UserRole, studentId?: string) => {
    try {
      setLoading(true);
      
      // In a real app, we would call supabase.auth.signUp here
      // For student role, validate student ID
      if (role === 'student') {
        if (!studentId || !validateStudentId(studentId)) {
          throw new Error("Invalid student ID");
        }
      }
      
      // Simulate signup delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user with the selected role
      if (MOCK_USERS[role]) {
        const mockUser = MOCK_USERS[role];
        mockUser.email = email;
        if (role === 'student' && studentId) {
          (mockUser.profile as any).student_id = studentId;
        }
        
        setUser(mockUser);
        setProfile(mockUser.profile);
        
        // Save role and email to localStorage
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        
        // Navigate to dashboard
        navigate(`/${role}/dashboard`);
        
        toast({
          title: "Account created",
          description: `Welcome to UniSync, ${mockUser.profile.full_name}!`,
        });
      } else {
        throw new Error("Invalid role");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Validate student ID
  const validateStudentId = (studentId: string): boolean => {
    return VALID_STUDENT_IDS.includes(studentId);
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear state and localStorage
      setUser(null);
      setProfile(null);
      localStorage.removeItem("userRole");
      
      // Keep email for next login
      // (In a real app, we would call supabase.auth.signOut here)
      
      // Navigate to login
      navigate("/auth/login");
      
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
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      validateStudentId 
    }}>
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
