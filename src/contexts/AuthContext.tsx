
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Types
type UserRole = "student" | "staff" | "admin";
type User = { id: string; email: string; };
type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string;
  student_id?: string | null;
  staff_id?: string | null;
  admin_id?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

// Valid student IDs - no longer used as we now validate 13-digit numbers directly
export const VALID_STUDENT_IDS = [
  "60821", "60822", "60823", "60824", "60825", 
  "60826", "60827", "60828", "60829", "60830"
];

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
      student_id: "60821",
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

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, roleData?: { role: UserRole; id: string }) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, userData: { fullName: string; id: string }) => Promise<void>;
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
            setProfile(MOCK_USERS[savedRole].profile);
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
  const signIn = async (email: string, password: string, roleData?: { role: UserRole; id: string }) => {
    try {
      setLoading(true);
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if credentials match mock users
        const role = roleData?.role || 'student';
        const mockUser = MOCK_USERS[role];
        
        if (mockUser && mockUser.email === email) {
          // Validate role-specific ID
          let idValid = false;
          
          if (role === 'student' && roleData?.id) {
            // Check if the profile has student_id property before accessing it
            if (mockUser.profile && 'student_id' in mockUser.profile && mockUser.profile.student_id === roleData.id) {
              idValid = true;
            }
          } else if (role === 'staff' && roleData?.id) {
            // Check if the profile has staff_id property before accessing it
            if (mockUser.profile && 'staff_id' in mockUser.profile && mockUser.profile.staff_id === roleData.id) {
              idValid = true;
            }
          } else if (role === 'admin' && roleData?.id) {
            // Check if the profile has admin_id property before accessing it
            if (mockUser.profile && 'admin_id' in mockUser.profile && mockUser.profile.admin_id === roleData.id) {
              idValid = true;
            }
          }
          
          if (!idValid) {
            throw new Error(`Invalid ${role} ID`);
          }
          
          setUser(mockUser);
          setProfile(mockUser.profile);
          
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
          if (roleData) {
            if (profileData.role !== roleData.role) {
              throw new Error(`This account is not registered as a ${roleData.role}`);
            }
            
            // Validate ID based on role with type checking
            if (roleData.role === 'student') {
              if (!profileData.student_id || profileData.student_id !== roleData.id) {
                throw new Error('Invalid Student ID');
              }
            } else if (roleData.role === 'staff') {
              if (!profileData.staff_id || profileData.staff_id !== roleData.id) {
                throw new Error('Invalid Staff ID');
              }
            } else if (roleData.role === 'admin') {
              if (!profileData.admin_id || profileData.admin_id !== roleData.id) {
                throw new Error('Invalid Admin ID');
              }
            }
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
  const signUp = async (email: string, password: string, role: UserRole, userData: { fullName: string; id: string }) => {
    try {
      setLoading(true);
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Simulate signup delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For student role, validate student ID using the validateRegisterNumber function
        if (role === 'student' && !/^\d{13}$/.test(userData.id)) {
          throw new Error("Invalid register number. Must be exactly 13 digits.");
        }
        
        // Create mock user with the selected role
        const mockUser = { ...MOCK_USERS[role] };
        mockUser.email = email;
        
        // Update the appropriate ID field based on role
        if (role === 'student' && mockUser.profile) {
          mockUser.profile.student_id = userData.id;
        } else if (role === 'staff' && mockUser.profile) {
          mockUser.profile.staff_id = userData.id;
        } else if (role === 'admin' && mockUser.profile) {
          mockUser.profile.admin_id = userData.id;
        }
        
        if (mockUser.profile) {
          mockUser.profile.full_name = userData.fullName;
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
          description: `Welcome to UniSync, ${userData.fullName}!`,
        });
      } else {
        // Real Supabase signup
        console.log("Signing up with:", { email, password, role, userData });
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: userData.fullName,
              role,
              [`${role}_id`]: userData.id,
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || '' });
          
          // Create profile object from user metadata
          const newProfile: Profile = {
            id: data.user.id,
            email: data.user.email || '',
            full_name: userData.fullName,
            role,
          };
          
          // Set the appropriate ID field based on role
          if (role === 'student') {
            newProfile.student_id = userData.id;
          } else if (role === 'staff') {
            newProfile.staff_id = userData.id;
          } else if (role === 'admin') {
            newProfile.admin_id = userData.id;
          }
          
          setProfile(newProfile);
          
          // Navigate to dashboard
          navigate(`/${role}/dashboard`);
          
          toast({
            title: "Account created",
            description: `Welcome to UniSync, ${userData.fullName}!`,
          });
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

  // Validate student ID
  const validateStudentId = (studentId: string): boolean => {
    // Change this to accept any 13-digit register number instead of using VALID_STUDENT_IDS
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
