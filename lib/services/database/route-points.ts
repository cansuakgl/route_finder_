import { supabase } from "../../supabase";
import type { RoutePoint, RoutePointWithConnections } from "../../types/database";

export interface RoutePointsService {
  getPointsByRouteId: (routeId: string) => Promise<RoutePoint[]>;
  getPointsWithConnections: (routeId: string) => Promise<RoutePointWithConnections[]>;
  getPointById: (pointId: string) => Promise<RoutePoint | null>;
}

export async function getPointsByRouteId(
  routeId: string
): Promise<RoutePoint[]> {
  const { data, error } = await supabase
    .from("route_points")
    .select("*")
    .eq("route_id", routeId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching route points:", error);
    return [];
  }

  return data ?? [];
}

export async function getPointsWithConnections(
  routeId: string
): Promise<RoutePointWithConnections[]> {
  const { data, error } = await supabase
    .from("route_points_with_connections")
    .select("*")
    .eq("route_id", routeId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching points with connections:", error);
    return [];
  }

  return data ?? [];
}

export async function getPointById(pointId: string): Promise<RoutePoint | null> {
  const { data, error } = await supabase
    .from("route_points")
    .select("*")
    .eq("id", pointId)
    .single();

  if (error) {
    console.error("Error fetching point:", error);
    return null;
  }

  return data;
}



export const routePointsService: RoutePointsService = {
  getPointsByRouteId,
  getPointsWithConnections,
  getPointById,
};
