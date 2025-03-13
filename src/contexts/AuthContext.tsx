
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'staff' | 'admin';
  email: string;
  student_id: string | null;
  staff_id: string | null;
  admin_id: string | null;
  phone: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, id: string, role: 'student' | 'staff' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      setLoading(true);
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile fetched:', data);
      setProfile(data as Profile);
      
      // If we have a profile with a role, navigate to the appropriate dashboard
      if (data && data.role) {
        navigate(`/${data.role}/dashboard`, { replace: true });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      toast({
        title: 'Error fetching profile',
        description: 'Please try signing in again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email: string, id: string, role: 'student' | 'staff' | 'admin') => {
    try {
      setLoading(true);
      console.log('Signing in with:', { email, id, role });
      
      // In a real app, we would validate the ID against the user's records
      // For now, we'll simply authenticate with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: id, // Using ID as password for simplicity (not recommended for production)
      });

      if (error) {
        console.log('Sign in error, attempting sign up:', error);
        
        // If signin fails, try to create an account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: id,
          options: {
            data: {
              role,
              full_name: email.split('@')[0], // Simple placeholder name
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        toast({
          title: 'Account created',
          description: 'Your account has been created successfully',
        });
        
        // No need to navigate here as the onAuthStateChange listener will handle it
      } else {
        console.log('Sign in successful:', data);
        
        // Fetch profile will be called by onAuthStateChange
        // No need to navigate here as onAuthStateChange will handle it
      }
    } catch (error: any) {
      console.error('Error during authentication:', error);
      setLoading(false);
      toast({
        title: 'Error signing in',
        description: error.message || 'Please check your credentials and try again',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error signing out',
        description: error.message || 'An error occurred during sign out',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
