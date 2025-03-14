
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateRegisterNumber, validateCollegeDomainEmail } from "@/utils/validation";

// Types
type UserRole = "student" | "staff" | "admin";

type User = { id: string; email: string; };

interface ProfileBase {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface StudentProfile extends ProfileBase {
  role: "student";
  student_id: string | null;
  staff_id?: string | null;
  admin_id?: string | null;
}

interface StaffProfile extends ProfileBase {
  role: "staff";
  student_id?: string | null;
  staff_id: string | null;
  admin_id?: string | null;
}

interface AdminProfile extends ProfileBase {
  role: "admin";
  student_id?: string | null;
  staff_id?: string | null;
  admin_id: string | null;
}

type Profile = StudentProfile | StaffProfile | AdminProfile;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, roleData?: { role: UserRole; id?: string }) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, userData: { fullName: string; id?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  validateStudentId: (studentId: string) => boolean;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      student_id: "2213141033127",
      staff_id: null,
      admin_id: null,
      phone: null,
      avatar_url: null,
    }
  },
  staff: {
    id: "staff-123",
    email: "staff@college.edu",
    profile: {
      id: "staff-123",
      role: "staff" as UserRole,
      full_name: "Staff User",
      email: "staff@college.edu",
      student_id: null,
      staff_id: "STA001",
      admin_id: null,
      phone: null,
      avatar_url: null,
    }
  },
  admin: {
    id: "admin-123",
    email: "admin@college.edu",
    profile: {
      id: "admin-123",
      role: "admin" as UserRole,
      full_name: "Admin User",
      email: "admin@college.edu",
      student_id: null,
      staff_id: null,
      admin_id: "ADM001",
      phone: null,
      avatar_url: null,
    }
  }
};

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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // We have a valid session, get the user
          const { user } = session;
          setUser({ id: user.id, email: user.email || '' });
          
          // Fetch the user profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (profileData) {
            setProfile(profileData as Profile);
            localStorage.setItem("userRole", profileData.role);
          }
        } else {
          // Check localStorage for mock data in development
          const savedEmail = localStorage.getItem("userEmail");
          const savedRole = localStorage.getItem("userRole") as UserRole | null;
          
          if (savedEmail && savedRole && MOCK_USERS[savedRole]) {
            setUser(MOCK_USERS[savedRole]);
            setProfile(MOCK_USERS[savedRole].profile as Profile);
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
  const signIn = async (email: string, password: string, roleData?: { role: UserRole; id?: string }) => {
    try {
      setLoading(true);
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if credentials match mock users
        const role = roleData?.role || 'student';
        const mockUser = MOCK_USERS[role];
        
        if (mockUser && mockUser.email === email) {
          // Staff and Admin require college domain emails
          if ((role === 'staff' || role === 'admin') && !email.endsWith('@college.edu')) {
            throw new Error(`${role} must use a college domain email`);
          }
          
          setUser(mockUser);
          setProfile(mockUser.profile as Profile);
          
          // Save role and email to localStorage
          localStorage.setItem("userRole", role);
          localStorage.setItem("userEmail", email);
          
          // Navigate to dashboard
          navigate(`/${role}/dashboard`);
          
          toast({
            title: "Sign in successful",
            description: `Welcome back, ${mockUser.profile.full_name}!`,
          });
        } else {
          throw new Error("Invalid login credentials");
        }
      } else {
        // Real Supabase authentication
        console.log("Signing in with:", { email, password });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Fetch the user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) throw profileError;

          // Role-specific validations
          if (roleData && profileData.role !== roleData.role) {
            throw new Error(`This account is not registered as a ${roleData.role}`);
          }
          
          // Staff and Admin require college domain emails
          if ((profileData.role === 'staff' || profileData.role === 'admin') && 
              !profileData.email.endsWith('@college.edu')) {
            throw new Error(`${profileData.role} must use a college domain email`);
          }
          
          setUser({ id: data.user.id, email: data.user.email || '' });
          setProfile(profileData as Profile);
          
          // Navigate to dashboard
          navigate(`/${profileData.role}/dashboard`);
          
          toast({
            title: "Sign in successful",
            description: `Welcome back, ${profileData.full_name}!`,
          });
        }
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, role: UserRole, userData: { fullName: string; id?: string }) => {
    try {
      setLoading(true);
      
      // Role-specific validations
      if (role === 'student') {
        if (!userData.id || !validateRegisterNumber(userData.id)) {
          throw new Error("Invalid register number. Must be exactly 13 digits.");
        }
      } else {
        // For staff and admin, validate college domain email
        if (!validateCollegeDomainEmail(email)) {
          throw new Error("Staff and admin must use a valid college domain email.");
        }
      }
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Simulate signup delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create mock user with the selected role
        const mockUser = { ...MOCK_USERS[role] };
        mockUser.email = email;
        
        // Update the profile data with user information
        if (role === 'student') {
          mockUser.profile = {
            ...mockUser.profile,
            student_id: userData.id,
            staff_id: null,
            admin_id: null,
            full_name: userData.fullName,
            email: email,
            role: 'student',
            phone: null,
            avatar_url: null
          } as StudentProfile;
        } else if (role === 'staff') {
          mockUser.profile = {
            ...mockUser.profile,
            student_id: null,
            staff_id: 'STAFF' + Math.floor(1000 + Math.random() * 9000),
            admin_id: null,
            full_name: userData.fullName,
            email: email,
            role: 'staff',
            phone: null,
            avatar_url: null
          } as StaffProfile;
        } else if (role === 'admin') {
          mockUser.profile = {
            ...mockUser.profile,
            student_id: null,
            staff_id: null,
            admin_id: 'ADMIN' + Math.floor(1000 + Math.random() * 9000),
            full_name: userData.fullName,
            email: email,
            role: 'admin',
            phone: null,
            avatar_url: null
          } as AdminProfile;
        }
        
        setUser(mockUser);
        setProfile(mockUser.profile as Profile);
        
        // Save role and email to localStorage
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
        
        // Navigate to dashboard
        navigate(`/${role}/dashboard`);
        
        toast({
          title: "Account created",
          description: `Welcome to UniSync, ${userData.fullName}!`,
        });
      } else {
        // Real Supabase signup
        console.log("Signing up with:", { email, password, role, userData });
        
        // Prepare metadata based on role
        const metadata: any = {
          full_name: userData.fullName,
          role
        };
        
        if (role === 'student' && userData.id) {
          metadata.student_id = userData.id;
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          // The profile will be created automatically by the database trigger
          // Just show a success message
          toast({
            title: "Account created",
            description: "Please check your email to verify your account.",
          });
          
          // Navigate to login page
          navigate("/auth/login");
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function (forgot password)
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Simulate reset password delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Reset link sent",
          description: "Check your email for the password reset link.",
        });
        
        // Navigate to login page after delay
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      } else {
        // Real Supabase reset password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/auth/reset-password',
        });
        
        if (error) throw error;
        
        toast({
          title: "Reset link sent",
          description: "Check your email for the password reset link.",
        });
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Reset password failed",
        description: error.message || "An error occurred while sending the reset link.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update password function (after reset)
  const updatePassword = async (password: string) => {
    try {
      setLoading(true);
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Simulate update password delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated.",
        });
        
        // Navigate to login page
        navigate("/auth/login");
      } else {
        // Real Supabase update password
        const { error } = await supabase.auth.updateUser({
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated.",
        });
        
        // Navigate to login page
        navigate("/auth/login");
      }
    } catch (error: any) {
      console.error("Update password error:", error);
      toast({
        title: "Update password failed",
        description: error.message || "An error occurred while updating your password.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Validate student ID
  const validateStudentId = (studentId: string): boolean => {
    // Accept any 13-digit register number
    return /^\d{13}$/.test(studentId);
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Clear state and localStorage
        setUser(null);
        setProfile(null);
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
      } else {
        // Real Supabase signout
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        setUser(null);
        setProfile(null);
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
      resetPassword,
      updatePassword,
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
