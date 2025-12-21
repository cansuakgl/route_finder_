import { initAuthDeepLinkListener, supabase } from '@/lib/supabase'; // Your Supabase client
import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';


type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const router = useRouter();
  const segments = useSegments();

   useEffect(() => {
    // Initialize deep link listener for auth callbacks (password reset, etc.)
    const cleanupDeepLinkListener = initAuthDeepLinkListener();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle password recovery event - redirect to reset password page
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
          router.replace('/(auth)/reset-password');
        }
        
        // Clear password recovery state when user signs out or changes password
        if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          setIsPasswordRecovery(false);
        }
      }
    );
    return () => {
      subscription.unsubscribe();
      cleanupDeepLinkListener?.();
    };
  }, []);

    useEffect(() => {
    if (isLoading) return;
    
    // Don't redirect if we're in password recovery mode
    if (isPasswordRecovery) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/signin');
    } 
    // Redirect authenticated users away from auth screens to main app
    else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading, isPasswordRecovery]);

   const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

  };

    const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    
    // If email confirmation is disabled, user will be logged in immediately
    // If enabled, user needs to confirm email first (session will be null)
    if (data.session) {
      // User is logged in immediately - redirect will happen via useEffect
      return;
    } else {
      // Email confirmation required - show a message
      alert('Success! Please check your email to confirm your account.');
    }
  };

    const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

    return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}