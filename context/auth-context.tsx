import { initAuthDeepLinkListener, supabase } from '@/lib/supabase'; // Your Supabase client
import { Session, User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import { useRouter, useSegments } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState } from 'react';

WebBrowser.maybeCompleteAuthSession();


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
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'routepicker',
      });

      console.log('Google OAuth redirect URI:', redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true, // Important: We handle the browser ourselves
        },
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Opening auth URL:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        console.log('WebBrowser result:', result);

        if (result.type === 'success') {
          // Extract the access token and refresh token from the URL
          const url = result.url;
          
          // Tokens can be in hash fragment (#) or query params (?)
          let params: URLSearchParams;
          if (url.includes('#')) {
            params = new URLSearchParams(url.split('#')[1]);
          } else if (url.includes('?')) {
            params = new URLSearchParams(url.split('?')[1]);
          } else {
            console.error('No tokens found in redirect URL:', url);
            throw new Error('Authentication failed - no tokens received');
          }

          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          console.log('Tokens received:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              throw sessionError;
            }
          } else {
            throw new Error('Missing tokens in OAuth response');
          }
        } else if (result.type === 'cancel') {
          console.log('User cancelled Google sign-in');
        } else {
          console.log('Auth session dismissed:', result.type);
        }
      }
    } catch (err) {
      console.error('signInWithGoogle error:', err);
      throw err;
    }
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