
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

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
$$ LANGUAGE plpgsql
SET search_path = public;

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
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS TABLE(
  deleted_sessions INTEGER,
  deleted_points INTEGER,
  deleted_segments INTEGER
)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_deleted_sessions INTEGER := 0;
  v_deleted_points INTEGER := 0;
  v_deleted_segments INTEGER := 0;
BEGIN
  DELETE FROM llm_sessions
  WHERE NOT EXISTS (SELECT 1 FROM routes WHERE routes.id = llm_sessions.route_id);
  GET DIAGNOSTICS v_deleted_sessions = ROW_COUNT;
  
  DELETE FROM route_points
  WHERE NOT EXISTS (SELECT 1 FROM routes WHERE routes.id = route_points.route_id);
  GET DIAGNOSTICS v_deleted_points = ROW_COUNT;
  
  DELETE FROM transit_segments
  WHERE NOT EXISTS (SELECT 1 FROM routes WHERE routes.id = transit_segments.route_id)
     OR NOT EXISTS (SELECT 1 FROM route_points WHERE route_points.id = transit_segments.from_point_id)
     OR NOT EXISTS (SELECT 1 FROM route_points WHERE route_points.id = transit_segments.to_point_id);
  GET DIAGNOSTICS v_deleted_segments = ROW_COUNT;
  
  RETURN QUERY SELECT v_deleted_sessions, v_deleted_points, v_deleted_segments;
END;
$$;

CREATE OR REPLACE FUNCTION create_route(
  p_user_id UUID,
  p_name TEXT,
  p_route_description TEXT DEFAULT NULL,
  p_session_description TEXT DEFAULT NULL,
  p_constraints TEXT[] DEFAULT NULL,
  p_route_points JSONB DEFAULT '[]'::JSONB,
  p_transit_segments JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route_id UUID;
  v_session_id UUID;
  v_point JSONB;
  v_segment JSONB;
  v_point_id UUID;
  v_from_point_id UUID;
  v_to_point_id UUID;
  v_position INTEGER;
  v_point_ids UUID[];
BEGIN
  INSERT INTO routes (user_id, name, route_description)
  VALUES (p_user_id, p_name, p_route_description)
  RETURNING id INTO v_route_id;

  INSERT INTO llm_sessions (route_id, session_route_description, constraints)
  VALUES (v_route_id, p_session_description, p_constraints)
  RETURNING id INTO v_session_id;

  v_point_ids := ARRAY[]::UUID[];
  v_position := 0;
  FOR v_point IN SELECT * FROM jsonb_array_elements(p_route_points)
  LOOP
    INSERT INTO route_points (route_id, position, name, address, latitude, longitude, tags)
    VALUES (
      v_route_id,
      v_position,
      v_point->>'name',
      v_point->>'address',
      (v_point->>'latitude')::DECIMAL(10, 8),
      (v_point->>'longitude')::DECIMAL(11, 8),
      CASE 
        WHEN v_point->'tags' IS NOT NULL THEN 
          ARRAY(SELECT jsonb_array_elements_text(v_point->'tags'))
        ELSE NULL
      END
    )
    RETURNING id INTO v_point_id;
    
    v_point_ids := array_append(v_point_ids, v_point_id);
    v_position := v_position + 1;
  END LOOP;

  FOR v_segment IN SELECT * FROM jsonb_array_elements(p_transit_segments)
  LOOP
    v_from_point_id := v_point_ids[(v_segment->>'from_position')::INTEGER + 1];
    v_to_point_id := v_point_ids[(v_segment->>'to_position')::INTEGER + 1];
    
    IF v_from_point_id IS NULL OR v_to_point_id IS NULL THEN
      RAISE EXCEPTION 'Invalid point positions in transit segment';
    END IF;
    
    INSERT INTO transit_segments (route_id, from_point_id, to_point_id, transit_type, distance_km, duration_minutes, notes)
    VALUES (
      v_route_id,
      v_from_point_id,
      v_to_point_id,
      (v_segment->>'transit_type')::transit_type_enum,
      (v_segment->>'distance_km')::DECIMAL(10, 2),
      (v_segment->>'duration_minutes')::INTEGER,
      v_segment->>'notes'
    );
  END LOOP;

  RETURN v_route_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_route(
  p_route_id UUID,
  p_name TEXT,
  p_route_description TEXT DEFAULT NULL,
  p_session_description TEXT DEFAULT NULL,
  p_constraints TEXT[] DEFAULT NULL,
  p_route_points JSONB DEFAULT '[]'::JSONB,
  p_transit_segments JSONB DEFAULT '[]'::JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_point JSONB;
  v_segment JSONB;
  v_position INTEGER;
  v_existing_point_id UUID;
  v_point_id UUID;
  v_from_point_id UUID;
  v_to_point_id UUID;
  v_point_ids UUID[];
  v_points_changed BOOLEAN := FALSE;
  v_old_points_json JSONB;
  v_new_points_json JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM routes WHERE id = p_route_id) THEN
    RAISE EXCEPTION 'Route with id % does not exist', p_route_id;
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'position', position,
      'name', name,
      'address', address,
      'latitude', latitude,
      'longitude', longitude,
      'tags', tags
    ) ORDER BY position
  )
  INTO v_old_points_json
  FROM route_points
  WHERE route_id = p_route_id;

  v_new_points_json := p_route_points;

  IF v_old_points_json IS DISTINCT FROM v_new_points_json THEN
    v_points_changed := TRUE;
  END IF;

  UPDATE routes
  SET name = p_name, route_description = p_route_description, updated_at = NOW()
  WHERE id = p_route_id;

  INSERT INTO llm_sessions (route_id, session_route_description, constraints)
  VALUES (p_route_id, p_session_description, p_constraints)
  RETURNING id INTO v_session_id;

  IF v_points_changed THEN
    DELETE FROM route_points WHERE route_id = p_route_id;
    
    v_point_ids := ARRAY[]::UUID[];
    v_position := 0;
    FOR v_point IN SELECT * FROM jsonb_array_elements(p_route_points)
    LOOP
      INSERT INTO route_points (route_id, position, name, address, latitude, longitude, tags)
      VALUES (
        p_route_id,
        v_position,
        v_point->>'name',
        v_point->>'address',
        (v_point->>'latitude')::DECIMAL(10, 8),
        (v_point->>'longitude')::DECIMAL(11, 8),
        CASE 
          WHEN v_point->'tags' IS NOT NULL THEN 
            ARRAY(SELECT jsonb_array_elements_text(v_point->'tags'))
          ELSE NULL
        END
      )
      RETURNING id INTO v_point_id;
      
      v_point_ids := array_append(v_point_ids, v_point_id);
      v_position := v_position + 1;
    END LOOP;

    FOR v_segment IN SELECT * FROM jsonb_array_elements(p_transit_segments)
    LOOP
      v_from_point_id := v_point_ids[(v_segment->>'from_position')::INTEGER + 1];
      v_to_point_id := v_point_ids[(v_segment->>'to_position')::INTEGER + 1];
      
      IF v_from_point_id IS NULL OR v_to_point_id IS NULL THEN
        RAISE EXCEPTION 'Invalid point positions in transit segment';
      END IF;
      
      INSERT INTO transit_segments (route_id, from_point_id, to_point_id, transit_type, distance_km, duration_minutes, notes)
      VALUES (
        p_route_id,
        v_from_point_id,
        v_to_point_id,
        (v_segment->>'transit_type')::transit_type_enum,
        (v_segment->>'distance_km')::DECIMAL(10, 2),
        (v_segment->>'duration_minutes')::INTEGER,
        v_segment->>'notes'
      );
    END LOOP;
  END IF;

  RETURN TRUE;
END;
$$;
