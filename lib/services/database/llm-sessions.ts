import { supabase } from "../../supabase";
import type { LlmSession } from "../../types/database";

export interface LlmSessionsService {
  getSessionsByRouteId: (routeId: string) => Promise<LlmSession[]>;
  getLatestSession: (routeId: string) => Promise<LlmSession | null>;
}

export async function getSessionsByRouteId(
  routeId: string
): Promise<LlmSession[]> {
  const { data, error } = await supabase
    .from("llm_sessions")
    .select("*")
    .eq("route_id", routeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching LLM sessions:", error);
    return [];
  }

  return data ?? [];
}
export async function getLatestSession(
  routeId: string
): Promise<LlmSession | null> {
  const { data, error } = await supabase
    .from("llm_sessions")
    .select("*")
    .eq("route_id", routeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching latest session:", error);
    return null;
  }

  return data;
}



export const llmSessionsService: LlmSessionsService = {
  getSessionsByRouteId,
  getLatestSession,
};
