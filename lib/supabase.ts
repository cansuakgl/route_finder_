import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { Platform } from 'react-native';
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY is not defined in environment variables')
}

const isWeb = Platform.OS === 'web'

const authOptions = isWeb
  ? {
      // On web, let @supabase/auth-js use its own web storage adapter.
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  : {
      // On native, use AsyncStorage for persistence.
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: authOptions,
})

/**
 * Handle deep link URLs for auth (password reset, email confirmation, etc.)
 * Extracts tokens from the URL fragment and sets the session
 */
export async function handleAuthDeepLink(url: string): Promise<boolean> {
  // Parse the URL to extract hash fragments
  // Supabase sends tokens in the hash fragment: #access_token=...&refresh_token=...&type=recovery
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return false;

  const hash = url.substring(hashIndex + 1);
  const params = new URLSearchParams(hash);
  
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    
    if (error) {
      console.error('Error setting session from deep link:', error);
      return false;
    }
    
    return true;
  }

  return false;
}

/**
 * Initialize deep link listener for auth callbacks
 * Call this once when the app starts
 */
export function initAuthDeepLinkListener() {
  if (isWeb) return; // Web handles this automatically with detectSessionInUrl

  // Handle URL that opened the app (cold start)
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleAuthDeepLink(url);
    }
  });

  // Handle URL when app is already open (warm start)
  const subscription = Linking.addEventListener('url', (event) => {
    handleAuthDeepLink(event.url);
  });

  return () => {
    subscription.remove();
  };
}
