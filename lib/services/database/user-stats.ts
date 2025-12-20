import { supabase } from "../../supabase";
import type { UserRouteStats } from "../../types/database";

export interface UserStatsService {
  getUserStats: () => Promise<UserRouteStats | null>;
  cleanupOrphanedData: () => Promise<CleanupResult>;
}

export interface CleanupResult {
  deleted_sessions: number;
  deleted_points: number;
  deleted_segments: number;
}


export async function getUserStats(): Promise<UserRouteStats | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_route_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned - user has no routes yet
      return {
        user_id: user.id,
        total_routes: 0,
        total_points: 0,
        total_segments: 0,
        total_distance_traveled_km: 0,
        total_duration_minutes: 0,
      };
    }
    console.error("Error fetching user stats:", error);
    return null;
  }

  return data;
}

export async function cleanupOrphanedData(): Promise<CleanupResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("cleanup_orphaned_data");

  if (error) {
    console.error("Error cleaning up orphaned data:", error);
    throw new Error(error.message);
  }

  const result = Array.isArray(data) ? data[0] : data;

  return result as CleanupResult;
}

export const userStatsService: UserStatsService = {
  getUserStats,
  cleanupOrphanedData,
};
