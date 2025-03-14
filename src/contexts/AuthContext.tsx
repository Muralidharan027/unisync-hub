import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Types
type UserRole = "student" | "staff" | "admin";
type User = { id: string; email: string; role: UserRole };
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

// Mock users storage
const USERS_BY_EMAIL: Record<string, User & { profile: Profile }> = {};

// Valid student IDs
export const VALID_STUDENT_IDS = [
  "60821", "60822", "60823", "60824", "60825", 
  "60826", "60827", "60828", "60829", "60830"
];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<void>;
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
        
        if (savedEmail && savedRole) {
          // Look up the user by email
          const savedUser = USERS_BY_EMAIL[savedEmail];
          
          // If user exists and role matches
          if (savedUser && savedUser.role === savedRole) {
            setUser(savedUser);
            setProfile(savedUser.profile);
            
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
  const signIn = async (email: string, password: string, role?: UserRole) => {
    try {
      setLoading(true);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // If a role is specified, check if the user exists with that role
      if (role) {
        const existingUser = USERS_BY_EMAIL[email];
        
        // If user exists but with a different role
        if (existingUser && existingUser.role !== role) {
          throw new Error(`This email is registered as a ${existingUser.role}. Please use a different email for ${role} role.`);
        }
        
        // If user doesn't exist, create a new one with that role
        if (!existingUser) {
          // Create a mock user for this role
          createDefaultUserForRole(email, role);
        }
      }
      
      // Get the user from our storage
      const user = USERS_BY_EMAIL[email];
      
      if (!user) {
        throw new Error("Email not recognized. Please sign up first.");
      }
      
      // Store email and role for the session
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", user.role);
      
      // Set user and profile in state
      setUser(user);
      setProfile(user.profile);
      
      // Load saved profile data from localStorage if exists
      const savedProfile = localStorage.getItem(`profile_${email}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(prev => prev ? { ...prev, ...parsedProfile } : parsedProfile);
      }
      
      // Navigate to appropriate dashboard based on role
      navigate(`/${user.role}/dashboard`);
      
      toast({
        title: "Sign in successful",
        description: `Welcome back! You are logged in as ${user.role}.`,
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in UI
    } finally {
      setLoading(false);
    }
  };

  // Helper to create default users for roles
  const createDefaultUserForRole = (email: string, role: UserRole) => {
    const userId = `${role}-${Date.now()}`;
    const user = {
      id: userId,
      email,
      role,
      profile: {
        id: userId,
        role,
        full_name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
        email,
        phone: null,
        avatar_url: null,
      }
    };
    
    // Add role-specific IDs
    if (role === 'student') {
      user.profile.student_id = 'STU' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    } else if (role === 'staff') {
      user.profile.staff_id = 'STA' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    } else if (role === 'admin') {
      user.profile.admin_id = 'ADM' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    }
    
    // Store in our users object
    USERS_BY_EMAIL[email] = user;
    
    return user;
  };

  // Sign up function
  const signUp = async (email: string, password: string, role: UserRole, studentId?: string) => {
    try {
      setLoading(true);
      
      // Check if email already exists with a different role
      const existingUser = USERS_BY_EMAIL[email];
      if (existingUser) {
        throw new Error(`This email is already registered as a ${existingUser.role}. Please use a different email for ${role} role.`);
      }
      
      // For student role, validate student ID
      if (role === 'student') {
        if (!studentId || !validateStudentId(studentId)) {
          throw new Error("Invalid student ID");
        }
      }
      
      // Simulate signup delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user for the selected role
      const user = createDefaultUserForRole(email, role);
      
      // If student role and ID provided, update the student_id
      if (role === 'student' && studentId) {
        user.profile.student_id = studentId;
      }
      
      setUser(user);
      setProfile(user.profile);
      
      // Save role and email to localStorage
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email);
      
      // Navigate to dashboard
      navigate(`/${role}/dashboard`);
      
      toast({
        title: "Account created",
        description: `Welcome to UniSync, you are registered as a ${role}!`,
      });
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
      
      // Also update in our storage
      if (USERS_BY_EMAIL[user.email]) {
        USERS_BY_EMAIL[user.email].profile = newProfile;
      }
      
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
