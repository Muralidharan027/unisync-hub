
import { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Profile, UserRole } from "@/types/auth";
import { VALID_STUDENT_IDS } from "@/constants/validation";
import { validateStudentId, generateRoleId } from "@/utils/auth-utils";

// Re-export constants for backward compatibility
export { VALID_STUDENT_IDS };

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
        setLoading(true);
        // Check Supabase for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          return;
        }
        
        if (data.session) {
          // Get user metadata from session
          const sessionUser = data.session.user;
          const userRole = sessionUser.user_metadata.role as UserRole || 'student';
          
          // Create user object
          const authUser: User = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            role: userRole
          };
          
          setUser(authUser);
          
          // Fetch profile from user_metadata or from a profiles table
          const userProfile: Profile = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            full_name: sessionUser.user_metadata.full_name || 'New User',
            role: userRole,
            phone: sessionUser.user_metadata.phone || null,
            avatar_url: sessionUser.user_metadata.avatar_url || null,
            student_id: userRole === 'student' ? sessionUser.user_metadata.student_id : undefined,
            staff_id: userRole === 'staff' ? sessionUser.user_metadata.staff_id : undefined,
            admin_id: userRole === 'admin' ? sessionUser.user_metadata.admin_id : undefined,
          };
          
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    
    // Set up listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const sessionUser = session.user;
        const userRole = sessionUser.user_metadata.role as UserRole || 'student';
        
        // Create user object
        const authUser: User = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          role: userRole
        };
        
        setUser(authUser);
        
        // Create profile from user_metadata
        const userProfile: Profile = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name: sessionUser.user_metadata.full_name || 'New User',
          role: userRole,
          phone: sessionUser.user_metadata.phone || null,
          avatar_url: sessionUser.user_metadata.avatar_url || null,
          student_id: userRole === 'student' ? sessionUser.user_metadata.student_id : undefined,
          staff_id: userRole === 'staff' ? sessionUser.user_metadata.staff_id : undefined,
          admin_id: userRole === 'admin' ? sessionUser.user_metadata.admin_id : undefined,
        };
        
        setProfile(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string, role?: UserRole) => {
    try {
      setLoading(true);
      
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error("No user returned from authentication");
      }
      
      const sessionUser = data.user;
      const userRole = sessionUser.user_metadata.role as UserRole || 'student';
      
      // If role is specified, check if it matches
      if (role && role !== userRole) {
        await supabase.auth.signOut();
        throw new Error(`This email is not registered as a ${role}. Please use the correct role or register first.`);
      }
      
      // Navigate to appropriate dashboard based on role
      navigate(`/${userRole}/dashboard`);
      
      toast({
        title: "Sign in successful",
        description: `Welcome back! You are logged in as ${userRole}.`,
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

  // Sign up function
  const signUp = async (email: string, password: string, role: UserRole, studentId?: string) => {
    try {
      setLoading(true);
      
      // For student role, validate student ID
      if (role === 'student') {
        if (!studentId || !validateStudentId(studentId)) {
          throw new Error("Invalid student ID");
        }
      }
      
      // Prepare user metadata
      const userData = {
        role,
        full_name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      };
      
      // Add role-specific IDs
      if (role === 'student' && studentId) {
        Object.assign(userData, { student_id: studentId });
      } else if (role === 'staff') {
        Object.assign(userData, { staff_id: generateRoleId(role) });
      } else if (role === 'admin') {
        Object.assign(userData, { admin_id: generateRoleId(role) });
      }
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        throw error;
      }
      
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

  // Update profile function
  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    try {
      setLoading(true);
      
      if (!profile || !user) {
        throw new Error("No active user session");
      }
      
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: updatedProfile
      });
      
      if (error) {
        throw error;
      }
      
      // Update local profile state
      const newProfile = { ...profile, ...updatedProfile };
      setProfile(newProfile);
      
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
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear state
      setUser(null);
      setProfile(null);
      
      // Navigate to login
      navigate("/auth/login");
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error: any) {
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

// Export the context
export { AuthContext };
