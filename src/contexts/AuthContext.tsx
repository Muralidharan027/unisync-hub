
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
  phone: string | null;
  department: string | null;
  avatar_url: string | null;
  persist_data: boolean | null;
  created_at?: string;
  updated_at?: string;
}

interface StudentProfile extends ProfileBase {
  role: "student";
  student_id: string | null;
  staff_id: null;
  admin_id: null;
}

interface StaffProfile extends ProfileBase {
  role: "staff";
  student_id: null;
  staff_id: string | null;
  admin_id: null;
}

interface AdminProfile extends ProfileBase {
  role: "admin";
  student_id: null;
  staff_id: null;
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
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
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
      department: null,
      avatar_url: null,
      persist_data: false,
    }
  },
  staff: {
    id: "staff-123",
    email: "staff@gurunanakcollege.edu.in",
    profile: {
      id: "staff-123",
      role: "staff" as UserRole,
      full_name: "Staff User",
      email: "staff@gurunanakcollege.edu.in",
      student_id: null,
      staff_id: "STA001",
      admin_id: null,
      phone: null,
      department: null,
      avatar_url: null,
      persist_data: false,
    }
  },
  admin: {
    id: "admin-123",
    email: "admin@gurunanakcollege.edu.in",
    profile: {
      id: "admin-123",
      role: "admin" as UserRole,
      full_name: "Admin User",
      email: "admin@gurunanakcollege.edu.in",
      student_id: null,
      staff_id: null,
      admin_id: "ADM001",
      phone: null,
      department: null,
      avatar_url: null,
      persist_data: false,
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
        console.log("Checking session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found:", session);
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
            console.error("Error fetching profile:", error);
            throw error;
          }
          
          if (profileData) {
            console.log("Profile data:", profileData);
            setProfile(profileData as Profile);
            localStorage.setItem("userRole", profileData.role);
            localStorage.setItem("userEmail", profileData.email);
          } else {
            console.log("No profile found for user:", user.id);
          }
        } else {
          console.log("No session found, checking localStorage");
          // Check localStorage for mock data in development
          const savedEmail = localStorage.getItem("userEmail");
          const savedRole = localStorage.getItem("userRole") as UserRole | null;
          
          if (savedEmail && savedRole && MOCK_USERS[savedRole]) {
            console.log("Using mock data for:", savedRole);
            setUser(MOCK_USERS[savedRole]);
            setProfile(MOCK_USERS[savedRole].profile as Profile);
          } else {
            console.log("No saved credentials found");
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
      console.log("Attempting sign in with:", email, "for role:", roleData?.role || "any");
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if there are any users in localStorage we've created
        const storedUsers = localStorage.getItem('mockUsers');
        const mockUsers = storedUsers ? JSON.parse(storedUsers) : {};
        
        // First check if this is a mock user we created during signup
        if (mockUsers[email] && mockUsers[email].password === password) {
          const userProfile = mockUsers[email].profile;
          
          // Validate role if specified
          if (roleData && roleData.role && userProfile.role !== roleData.role) {
            throw new Error(`This account is registered as a ${userProfile.role}, not a ${roleData.role}`);
          }
          
          setUser({ id: userProfile.id, email: email });
          setProfile(userProfile as Profile);
          
          // Save role and email to localStorage
          localStorage.setItem("userRole", userProfile.role);
          localStorage.setItem("userEmail", email);
          
          // Navigate to dashboard
          navigate(`/${userProfile.role}/dashboard`);
          
          toast({
            title: "Sign in successful",
            description: `Welcome back, ${userProfile.full_name || 'User'}!`,
          });
          return;
        }
        
        // Fall back to checking the predefined MOCK_USERS
        const role = roleData?.role || 'student';
        const mockUser = MOCK_USERS[role];
        
        if (mockUser && mockUser.email === email) {
          // Staff and Admin require college domain emails
          if ((role === 'staff' || role === 'admin') && 
              !validateCollegeDomainEmail(email)) {
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
        console.log("Signing in with Supabase:", { email, password });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Supabase sign in error:", error);
          throw error;
        }
        
        if (data.user) {
          console.log("Supabase sign in successful:", data.user);
          // Fetch the user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            console.error("Profile fetch error:", profileError);
            throw profileError;
          }

          if (!profileData) {
            console.error("No profile found for user:", data.user.id);
            throw new Error("User profile not found. Please contact support.");
          }

          // Role-specific validations
          if (roleData && profileData.role !== roleData.role) {
            throw new Error(`This account is not registered as a ${roleData.role}`);
          }
          
          // Staff and Admin require college domain emails
          if ((profileData.role === 'staff' || profileData.role === 'admin') && 
              !validateCollegeDomainEmail(profileData.email)) {
            throw new Error(`${profileData.role} must use a college domain email`);
          }
          
          setUser({ id: data.user.id, email: data.user.email || '' });
          setProfile(profileData as Profile);
          
          // Save role in localStorage
          localStorage.setItem("userRole", profileData.role);
          localStorage.setItem("userEmail", profileData.email);
          
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
      console.log("Signing up with:", { email, role, userData });
      
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
        
        // Generate a UUID-like ID for the user
        const mockUserId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create profile based on role
        let userProfile: Profile;
        
        if (role === 'student') {
          userProfile = {
            id: mockUserId,
            role: 'student',
            full_name: userData.fullName,
            email: email,
            student_id: userData.id || null,
            staff_id: null,
            admin_id: null,
            phone: null,
            department: null,
            avatar_url: null,
            persist_data: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else if (role === 'staff') {
          userProfile = {
            id: mockUserId,
            role: 'staff',
            full_name: userData.fullName,
            email: email,
            student_id: null,
            staff_id: `STAFF${Math.floor(1000 + Math.random() * 9000)}`,
            admin_id: null,
            phone: null,
            department: null,
            avatar_url: null,
            persist_data: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        } else {
          userProfile = {
            id: mockUserId,
            role: 'admin',
            full_name: userData.fullName,
            email: email,
            student_id: null,
            staff_id: null,
            admin_id: `ADMIN${Math.floor(1000 + Math.random() * 9000)}`,
            phone: null,
            department: null,
            avatar_url: null,
            persist_data: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        // Store the user in localStorage for future sign-ins
        const storedUsers = localStorage.getItem('mockUsers');
        const mockUsers = storedUsers ? JSON.parse(storedUsers) : {};
        
        // Add this user to our mock database
        mockUsers[email] = {
          password,
          profile: userProfile
        };
        
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        
        // Set the current user and profile
        setUser({ id: mockUserId, email });
        setProfile(userProfile);
        
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
        console.log("Signing up with Supabase:", { email, password, role, userData });
        
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
            data: metadata,
            emailRedirectTo: window.location.origin + '/auth/login'
          }
        });
        
        if (error) {
          console.error("Supabase signup error:", error);
          throw error;
        }
        
        console.log("Supabase signup response:", data);
        
        if (data.user) {
          console.log("User created successfully:", data.user);
          
          // For development purposes, immediately sign in the user
          try {
            const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (sessionError) {
              console.error("Auto sign-in error:", sessionError);
              throw sessionError;
            }
            
            if (sessionData.user) {
              console.log("Auto sign-in successful:", sessionData.user);
              setUser({ id: sessionData.user.id, email: sessionData.user.email || '' });
              
              // Check for or create profile
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', sessionData.user.id)
                .single();
              
              if (profileError && profileError.code !== 'PGRST116') {
                console.error("Profile fetch error:", profileError);
              }
                
              if (profileData) {
                console.log("Found existing profile:", profileData);
                setProfile(profileData as Profile);
                
                // Save user info to localStorage as well
                localStorage.setItem("userRole", profileData.role);
                localStorage.setItem("userEmail", profileData.email);
                
                // Navigate to dashboard
                navigate(`/${profileData.role}/dashboard`);
                
                toast({
                  title: "Account created & signed in",
                  description: `Welcome to UniSync, ${profileData.full_name}!`,
                });
              } else {
                console.log("No profile found, waiting for trigger to create it");
                // Wait a bit and try again to get the profile
                setTimeout(async () => {
                  const { data: retryProfileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', sessionData.user!.id)
                    .single();
                    
                  if (retryProfileData) {
                    console.log("Retrieved profile on retry:", retryProfileData);
                    setProfile(retryProfileData as Profile);
                    localStorage.setItem("userRole", retryProfileData.role);
                    localStorage.setItem("userEmail", retryProfileData.email);
                    navigate(`/${retryProfileData.role}/dashboard`);
                  } else {
                    console.log("Could not retrieve profile after retry");
                    navigate("/auth/login");
                  }
                }, 2000);
              }
            }
          } catch (signInError) {
            console.error("Error during auto sign-in:", signInError);
            toast({
              title: "Account created",
              description: "Your account has been created. Please sign in.",
            });
            navigate("/auth/login");
          }
        } else {
          toast({
            title: "Account created",
            description: "Please check your email to verify your account.",
          });
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

  // Reset password function
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

  // Update password function
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to update your password');
      }
      
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
        // Simulate update password delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update mock user password if applicable
        const storedUsers = localStorage.getItem('mockUsers');
        if (storedUsers) {
          const mockUsers = JSON.parse(storedUsers);
          const userEmail = localStorage.getItem("userEmail");
          
          if (userEmail && mockUsers[userEmail]) {
            if (mockUsers[userEmail].password === currentPassword) {
              mockUsers[userEmail].password = newPassword;
              localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
              
              toast({
                title: "Password updated",
                description: "Your password has been successfully updated.",
              });
            } else {
              throw new Error('Current password is incorrect');
            }
          }
        } else {
          toast({
            title: "Password updated",
            description: "Your password has been successfully updated.",
          });
        }
      } else {
        // Real Supabase password update
        try {
          // First verify the current password by attempting to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
          });
          
          if (signInError) {
            throw new Error('Current password is incorrect');
          }
          
          // Update to the new password
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          
          if (error) throw error;
          
          toast({
            title: "Password updated",
            description: "Your password has been successfully updated.",
          });
        } catch (verifyError: any) {
          console.error("Verify current password error:", verifyError);
          throw new Error(verifyError.message || 'Current password is incorrect');
        }
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
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
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
