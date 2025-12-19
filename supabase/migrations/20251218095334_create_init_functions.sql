CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION validate_username_not_empty()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL OR length(trim(NEW.username)) = 0 THEN
    RAISE EXCEPTION 'Username cannot be empty or null';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_route_details(route_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'route', row_to_json(r.*),
    'points', (
      SELECT json_agg(row_to_json(rp.*) ORDER BY rp.position)
      FROM route_points rp
      WHERE rp.route_id = route_uuid
    ),
    'segments', (
      SELECT json_agg(row_to_json(ts.*))
      FROM transit_segments ts
      WHERE ts.route_id = route_uuid
    )
  ) INTO result
  FROM routes r
  WHERE r.id = route_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION calculate_route_metrics(route_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_distance_km', COALESCE(SUM(distance_km), 0),
    'total_duration_minutes', COALESCE(SUM(duration_minutes), 0),
    'total_points', COUNT(DISTINCT rp.id),
    'total_segments', COUNT(DISTINCT ts.id),
    'transit_types', json_agg(DISTINCT ts.transit_type)
  ) INTO result
  FROM routes r
  LEFT JOIN route_points rp ON rp.route_id = r.id
  LEFT JOIN transit_segments ts ON ts.route_id = r.id
  WHERE r.id = route_uuid
  GROUP BY r.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;


