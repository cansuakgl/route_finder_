import { supabase } from "../../supabase";
import type { TransitSegment, TransitType } from "../../types/database";

export interface TransitSegmentsService {
  getSegmentsByRouteId: (routeId: string) => Promise<TransitSegment[]>;
  getSegmentFromPoint: (pointId: string) => Promise<TransitSegment | null>;
  getSegmentToPoint: (pointId: string) => Promise<TransitSegment | null>;
}

export async function getSegmentsByRouteId(
  routeId: string
): Promise<TransitSegment[]> {
  const { data, error } = await supabase
    .from("transit_segments")
    .select("*")
    .eq("route_id", routeId);

  if (error) {
    console.error("Error fetching transit segments:", error);
    return [];
  }

  return data ?? [];
}


export async function getSegmentFromPoint(
  pointId: string
): Promise<TransitSegment | null> {
  const { data, error } = await supabase
    .from("transit_segments")
    .select("*")
    .eq("from_point_id", pointId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching segment from point:", error);
    return null;
  }

  return data;
}

export async function getSegmentToPoint(
  pointId: string
): Promise<TransitSegment | null> {
  const { data, error } = await supabase
    .from("transit_segments")
    .select("*")
    .eq("to_point_id", pointId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching segment to point:", error);
    return null;
  }

  return data;
}
export const transitSegmentsService: TransitSegmentsService = {
  getSegmentsByRouteId,
  getSegmentFromPoint,
  getSegmentToPoint,
};
