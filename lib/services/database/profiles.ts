import { supabase } from "../../supabase";
import type { Profile, ProfileUpdate } from "../../types/database";


export interface ProfilesService {
  getCurrentProfile: () => Promise<Profile | null>;
  updateProfile: (updates: ProfileUpdate) => Promise<Profile | null>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching current profile:", error);
    return null;
  }

  return data;
}

export async function updateProfile(
  updates: ProfileUpdate
): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to update profile");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("profiles") as any)
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error(error.message);
  }

  return data as Profile;
}

export async function checkUsernameAvailable(
  username: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("username", username);

  if (error) {
    console.error("Error checking username availability:", error);
    return false;
  }

  return count === 0;
}

export const profilesService: ProfilesService = {
  getCurrentProfile,
  updateProfile,
  checkUsernameAvailable,
};
