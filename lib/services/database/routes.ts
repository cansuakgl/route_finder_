import { supabase } from "../../supabase";
import type {
    Route,
    RouteDetails,
    RouteMetrics,
    RoutePointInput,
    RouteSummary,
    TransitSegmentInput,
} from "../../types/database";

export interface RoutesService {
  getRoutes: () => Promise<Route[]>;
  getRoutesSummary: () => Promise<RouteSummary[]>;
  getRouteById: (routeId: string) => Promise<Route | null>;
  getRouteDetails: (routeId: string) => Promise<RouteDetails | null>;
  getRouteMetrics: (routeId: string) => Promise<RouteMetrics | null>;
  searchRoutes: (query: string) => Promise<Route[]>;
  createRoute: (params: CreateRouteParams) => Promise<string>;
  updateRoute: (params: UpdateRouteParams) => Promise<boolean>;
  deleteRoute: (routeId: string) => Promise<boolean>;
}
export interface CreateRouteParams {
  name: string;
  routeDescription?: string | null;
  sessionDescription?: string | null;
  constraints?: string[] | null;
  routePoints?: RoutePointInput[];
  transitSegments?: TransitSegmentInput[];
}
export interface UpdateRouteParams {
  routeId: string;
  name: string;
  routeDescription?: string | null;
  sessionDescription?: string | null;
  constraints?: string[] | null;
  routePoints?: RoutePointInput[];
  transitSegments?: TransitSegmentInput[];
}

export async function getRoutes(): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching routes:", error);
    return [];
  }
  return data ?? [];
}

export async function getRoutesSummary(): Promise<RouteSummary[]> {
  const { data, error } = await supabase
    .from("routes_summary")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching routes summary:", error);
    return [];
  }

  return data ?? [];
}

export async function getRouteById(routeId: string): Promise<Route | null> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("id", routeId)
    .single();

  if (error) {
    console.error("Error fetching route:", error);
    return null;
  }

  return data;
}
export async function getRouteDetails(
  routeId: string
): Promise<RouteDetails | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("get_route_details", {
    route_uuid: routeId,
  });

  if (error) {
    console.error("Error fetching route details:", error);
    return null;
  }

  return data as RouteDetails;
}

export async function getRouteMetrics(
  routeId: string
): Promise<RouteMetrics | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("calculate_route_metrics", {
    route_uuid: routeId,
  });

  if (error) {
    console.error("Error calculating route metrics:", error);
    return null;
  }

  return data as RouteMetrics;
}

export async function createRoute(params: CreateRouteParams): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to create a route");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("create_route", {
    p_user_id: user.id,
    p_name: params.name,
    p_route_description: params.routeDescription ?? null,
    p_session_description: params.sessionDescription ?? null,
    p_constraints: params.constraints ?? null,
    p_route_points: params.routePoints ?? [],
    p_transit_segments: params.transitSegments ?? [],
  });

  if (error) {
    console.error("Error creating route:", error);
    throw new Error(error.message);
  }

  return data as string;
}

export async function updateRoute(params: UpdateRouteParams): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("update_route", {
    p_route_id: params.routeId,
    p_name: params.name,
    p_route_description: params.routeDescription ?? null,
    p_session_description: params.sessionDescription ?? null,
    p_constraints: params.constraints ?? null,
    p_route_points: params.routePoints ?? [],
    p_transit_segments: params.transitSegments ?? [],
  });

  if (error) {
    console.error("Error updating route:", error);
    throw new Error(error.message);
  }

  return data as boolean;
}


export async function deleteRoute(routeId: string): Promise<boolean> {
  const { error } = await supabase.from("routes").delete().eq("id", routeId);

  if (error) {
    console.error("Error deleting route:", error);
    throw new Error(error.message);
  }

  return true;
}
export async function searchRoutes(query: string): Promise<Route[]> {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .or(`name.ilike.%${query}%,route_description.ilike.%${query}%`)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error searching routes:", error);
    return [];
  }

  return data ?? [];
}

export const routesService: RoutesService = {
  getRoutes,
  getRoutesSummary,
  getRouteById,
  getRouteDetails,
  getRouteMetrics,
  searchRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
};
