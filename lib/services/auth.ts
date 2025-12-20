import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export interface AuthService {
  signUp: (email: string, password: string, username?: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  getSession: () => Promise<Session | null>;
  getUser: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  onAuthStateChange: (callback: (session: Session | null) => void) => () => void;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export async function signUp(
  email: string,
  password: string,
  username?: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username ?? email.split("@")[0],
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  return data.user;
}

export async function resetPassword(
  email: string
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

export async function updatePassword(
  newPassword: string
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { error };
}

export function onAuthStateChange(
  callback: (session: Session | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}
export const authService: AuthService = {
  signUp,
  signIn,
  signOut,
  getSession,
  getUser,
  resetPassword,
  updatePassword,
  onAuthStateChange,
};
