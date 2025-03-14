import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Mock user data for different roles with email mappings
const USER_ROLE_MAPPINGS = {
  'student@example.com': 'student',
  'staff@example.com': 'staff',
  'admin@example.com': 'admin'
};

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
  updateProfile: (updatedProfile: Partial<Profile>) => Promise<void>;
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
          // Verify the email matches the correct role
          const expectedRole = USER_ROLE_MAPPINGS[savedEmail as keyof typeof USER_ROLE_MAPPINGS];
          
          if (expectedRole && expectedRole === savedRole) {
            setUser(MOCK_USERS[savedRole]);
            setProfile(MOCK_USERS[savedRole].profile);
            
            // Load saved profile data from localStorage if exists
            const savedProfile = localStorage.getItem(`profile_${savedEmail}`);
            if (savedProfile) {
              const parsedProfile = JSON.parse(savedProfile);
              setProfile(prev => prev ? { ...prev, ...parsedProfile } : parsedProfile);
            }
          } else {
            // Email and role don't match, clear session
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");
          }
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
      
      // Check if this email has a predefined role
      const expectedRole = USER_ROLE_MAPPINGS[email as keyof typeof USER_ROLE_MAPPINGS];
      
      if (!expectedRole) {
        throw new Error("Email not recognized. Please sign up first.");
      }
      
      // Store email and role for the role selection page
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", expectedRole);
      
      // Set user and profile based on role
      setUser(MOCK_USERS[expectedRole]);
      setProfile(MOCK_USERS[expectedRole].profile);
      
      // Load saved profile data from localStorage if exists
      const savedProfile = localStorage.getItem(`profile_${email}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(prev => prev ? { ...prev, ...parsedProfile } : parsedProfile);
      }
      
      // Navigate to appropriate dashboard based on role
      navigate(`/${expectedRole}/dashboard`);
      
      toast({
        title: "Sign in successful",
        description: `Welcome back! You are logged in as ${expectedRole}.`,
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
      
      // Check if email already exists with a different role
      const existingRole = USER_ROLE_MAPPINGS[email as keyof typeof USER_ROLE_MAPPINGS];
      if (existingRole && existingRole !== role) {
        throw new Error(`This email is already registered as a ${existingRole}. Please use a different email for ${role} role.`);
      }
      
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
        const mockUser = { ...MOCK_USERS[role] };
        mockUser.email = email;
        mockUser.profile.email = email;
        
        if (role === 'student' && studentId) {
          (mockUser.profile as { student_id?: string }).student_id = studentId;
        }
        
        setUser(mockUser);
        setProfile(mockUser.profile);
        
        // Save role and email to localStorage
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        
        // Also update USER_ROLE_MAPPINGS (would be a database update in real app)
        (USER_ROLE_MAPPINGS as any)[email] = role;
        
        // Navigate to dashboard
        navigate(`/${role}/dashboard`);
        
        toast({
          title: "Account created",
          description: `Welcome to UniSync, you are registered as a ${role}!`,
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

  // Update profile function
  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    try {
      setLoading(true);
      
      if (!profile || !user) {
        throw new Error("No active user session");
      }
      
      // Update profile
      const newProfile = { ...profile, ...updatedProfile };
      setProfile(newProfile);
      
      // Save to localStorage for persistence
      localStorage.setItem(`profile_${user.email}`, JSON.stringify(newProfile));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile.",
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
      
      // Clear state
      setUser(null);
      setProfile(null);
      
      // Clear localStorage except for saved announcements and leave requests
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      
      // Keep data persistence option (if enabled by user)
      const dataPersistence = localStorage.getItem("dataPersistenceEnabled");
      
      // If data persistence is not enabled, clear stored data
      if (dataPersistence !== "true") {
        localStorage.removeItem("announcements");
        localStorage.removeItem("leaveRequests");
      }
      
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
      validateStudentId,
      updateProfile
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
