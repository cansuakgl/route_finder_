DROP VIEW IF EXISTS routes_summary;
DROP VIEW IF EXISTS route_points_with_connections;
DROP VIEW IF EXISTS user_route_stats;

CREATE VIEW routes_summary
WITH (security_invoker = true)
AS
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

CREATE VIEW route_points_with_connections
WITH (security_invoker = true)
AS
SELECT 
  rp.*,
  (SELECT row_to_json(t) FROM (
    SELECT id, to_point_id as next_point_id, transit_type, distance_km, duration_minutes
    FROM transit_segments 
    WHERE from_point_id = rp.id 
    LIMIT 1
  ) t) as outgoing_segment,
  (SELECT row_to_json(t) FROM (
    SELECT id, from_point_id as previous_point_id, transit_type, distance_km, duration_minutes
    FROM transit_segments 
    WHERE to_point_id = rp.id 
    LIMIT 1
  ) t) as incoming_segment
FROM route_points rp;

CREATE VIEW user_route_stats
WITH (security_invoker = true)
AS
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
