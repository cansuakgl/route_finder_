export type TransitType = "walking" | "driving" | "public_transport" | "cycling";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      routes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          route_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          route_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          route_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      llm_sessions: {
        Row: {
          id: string;
          route_id: string;
          session_route_description: string | null;
          constraints: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          session_route_description?: string | null;
          constraints?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          session_route_description?: string | null;
          constraints?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      route_points: {
        Row: {
          id: string;
          route_id: string;
          position: number;
          name: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          position: number;
          name: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          position?: number;
          name?: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
      };
      transit_segments: {
        Row: {
          id: string;
          route_id: string;
          from_point_id: string;
          to_point_id: string;
          transit_type: TransitType;
          distance_km: number | null;
          duration_minutes: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          from_point_id: string;
          to_point_id: string;
          transit_type: TransitType;
          distance_km?: number | null;
          duration_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          from_point_id?: string;
          to_point_id?: string;
          transit_type?: TransitType;
          distance_km?: number | null;
          duration_minutes?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      routes_summary: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          route_description: string | null;
          created_at: string;
          updated_at: string;
          point_count: number;
          segment_count: number;
          total_distance_km: number;
          total_duration_minutes: number;
        };
      };
      route_points_with_connections: {
        Row: {
          id: string;
          route_id: string;
          position: number;
          name: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          tags: string[] | null;
          created_at: string;
          outgoing_segment: {
            id: string;
            next_point_id: string;
            transit_type: TransitType;
            distance_km: number | null;
            duration_minutes: number | null;
          } | null;
          incoming_segment: {
            id: string;
            previous_point_id: string;
            transit_type: TransitType;
            distance_km: number | null;
            duration_minutes: number | null;
          } | null;
        };
      };
      user_route_stats: {
        Row: {
          user_id: string;
          total_routes: number;
          total_points: number;
          total_segments: number;
          total_distance_traveled_km: number;
          total_duration_minutes: number;
        };
      };
    };
    Functions: {
      get_route_details: {
        Args: { route_uuid: string };
        Returns: Json;
      };
      calculate_route_metrics: {
        Args: { route_uuid: string };
        Returns: Json;
      };
      create_route: {
        Args: {
          p_user_id: string;
          p_name: string;
          p_route_description: string | null;
          p_session_description: string | null;
          p_constraints: string[] | null;
          p_route_points: Json;
          p_transit_segments: Json;
        };
        Returns: string;
      };
      update_route: {
        Args: {
          p_route_id: string;
          p_name: string;
          p_route_description: string | null;
          p_session_description: string | null;
          p_constraints: string[] | null;
          p_route_points: Json;
          p_transit_segments: Json;
        };
        Returns: boolean;
      };
      cleanup_orphaned_data: {
        Args: Record<string, never>;
        Returns: {
          deleted_sessions: number;
          deleted_points: number;
          deleted_segments: number;
        }[];
      };
    };
    Enums: {
      transit_type_enum: TransitType;
    };
  };
}

// JSON type for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// Input types for RPC functions
// ============================================================================

/**
 * Input for creating a route point via RPC functions.
 * Position is determined by array order in create_route/update_route.
 */
export interface RoutePointInput {
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tags?: string[] | null;
}

/**
 * Input for creating a transit segment via RPC functions.
 * Uses position indices (0-based) to reference points in the routePoints array.
 */
export interface TransitSegmentInput {
  from_position: number;
  to_position: number;
  transit_type: TransitType;
  distance_km?: number | null;
  duration_minutes?: number | null;
  notes?: string | null;
}

// ============================================================================
// Output types from RPC functions
// ============================================================================

/**
 * Complete route details returned by get_route_details RPC function.
 */
export interface RouteDetails {
  route: {
    id: string;
    user_id: string;
    name: string;
    route_description: string | null;
    created_at: string;
    updated_at: string;
  };
  points: {
    id: string;
    route_id: string;
    position: number;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    tags: string[] | null;
    created_at: string;
  }[] | null;
  segments: {
    id: string;
    route_id: string;
    from_point_id: string;
    to_point_id: string;
    transit_type: TransitType;
    distance_km: number | null;
    duration_minutes: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }[] | null;
}

/**
 * Route metrics returned by calculate_route_metrics RPC function.
 */
export interface RouteMetrics {
  total_distance_km: number;
  total_duration_minutes: number;
  total_points: number;
  total_segments: number;
  transit_types: TransitType[];
}

// ============================================================================
// Convenience type aliases for table rows
// ============================================================================
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Route = Database["public"]["Tables"]["routes"]["Row"];
export type RouteInsert = Database["public"]["Tables"]["routes"]["Insert"];
export type RouteUpdate = Database["public"]["Tables"]["routes"]["Update"];

export type LlmSession = Database["public"]["Tables"]["llm_sessions"]["Row"];
export type LlmSessionInsert = Database["public"]["Tables"]["llm_sessions"]["Insert"];
export type LlmSessionUpdate = Database["public"]["Tables"]["llm_sessions"]["Update"];

export type RoutePoint = Database["public"]["Tables"]["route_points"]["Row"];
export type RoutePointInsert = Database["public"]["Tables"]["route_points"]["Insert"];
export type RoutePointUpdate = Database["public"]["Tables"]["route_points"]["Update"];

export type TransitSegment = Database["public"]["Tables"]["transit_segments"]["Row"];
export type TransitSegmentInsert = Database["public"]["Tables"]["transit_segments"]["Insert"];
export type TransitSegmentUpdate = Database["public"]["Tables"]["transit_segments"]["Update"];

export type RouteSummary = Database["public"]["Views"]["routes_summary"]["Row"];
export type RoutePointWithConnections = Database["public"]["Views"]["route_points_with_connections"]["Row"];
export type UserRouteStats = Database["public"]["Views"]["user_route_stats"]["Row"];
