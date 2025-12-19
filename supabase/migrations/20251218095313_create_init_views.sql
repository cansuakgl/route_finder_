CREATE VIEW routes_summary AS
SELECT 
  r.id,
  r.user_id,
  r.name,
  r.route_description,
  r.created_at,
  r.updated_at,
  COUNT(DISTINCT rp.id) as point_count,
  COUNT(DISTINCT ts.id) as segment_count,
  COALESCE(SUM(ts.distance_km), 0) as total_distance_km,
  COALESCE(SUM(ts.duration_minutes), 0) as total_duration_minutes
FROM routes r
LEFT JOIN route_points rp ON rp.route_id = r.id
LEFT JOIN transit_segments ts ON ts.route_id = r.id
GROUP BY r.id, r.user_id, r.name, r.route_description, r.created_at, r.updated_at;

CREATE VIEW route_points_with_connections AS
SELECT 
  rp.*,
  ts_out.id as outgoing_segment_id,
  ts_out.to_point_id as next_point_id,
  ts_out.transit_type as next_transit_type,
  ts_in.id as incoming_segment_id,
  ts_in.from_point_id as previous_point_id,
  ts_in.transit_type as previous_transit_type
FROM route_points rp
LEFT JOIN transit_segments ts_out ON ts_out.from_point_id = rp.id
LEFT JOIN transit_segments ts_in ON ts_in.to_point_id = rp.id;

CREATE VIEW user_route_stats AS
SELECT 
  r.user_id,
  COUNT(DISTINCT r.id) as total_routes,
  COUNT(DISTINCT rp.id) as total_points,
  COUNT(DISTINCT ts.id) as total_segments,
  COALESCE(SUM(ts.distance_km), 0) as total_distance_traveled_km,
  COALESCE(SUM(ts.duration_minutes), 0) as total_duration_minutes
FROM routes r
LEFT JOIN route_points rp ON rp.route_id = r.id
LEFT JOIN transit_segments ts ON ts.route_id = r.id
GROUP BY r.user_id;