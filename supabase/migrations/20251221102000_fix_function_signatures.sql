-- Fix function permissions for updated signatures with is_favorite parameter

-- First, drop the old function signatures if they exist (to avoid conflicts)
DROP FUNCTION IF EXISTS create_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB);
DROP FUNCTION IF EXISTS update_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB);

-- Recreate the functions with correct signatures and SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_route(
  p_user_id UUID,
  p_name TEXT,
  p_route_description TEXT DEFAULT NULL,
  p_session_description TEXT DEFAULT NULL,
  p_constraints TEXT[] DEFAULT NULL,
  p_route_points JSONB DEFAULT '[]'::JSONB,
  p_transit_segments JSONB DEFAULT '[]'::JSONB,
  p_is_favorite BOOLEAN DEFAULT FALSE
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
  -- Insert route with is_favorite
  INSERT INTO routes (user_id, name, route_description, is_favorite)
  VALUES (p_user_id, p_name, p_route_description, COALESCE(p_is_favorite, FALSE))
  RETURNING id INTO v_route_id;

  -- Insert LLM session
  INSERT INTO llm_sessions (route_id, session_route_description, constraints)
  VALUES (v_route_id, p_session_description, p_constraints)
  RETURNING id INTO v_session_id;

  -- Insert route points
  v_point_ids := ARRAY[]::UUID[];
  v_position := 0;

  FOR v_point IN SELECT * FROM jsonb_array_elements(p_route_points)
  LOOP
    INSERT INTO route_points (
      route_id, position, name, address, latitude, longitude, tags
    )
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

  -- Insert transit segments
  FOR v_segment IN SELECT * FROM jsonb_array_elements(p_transit_segments)
  LOOP
    v_from_point_id := v_point_ids[(v_segment->>'from_position')::INTEGER + 1];
    v_to_point_id   := v_point_ids[(v_segment->>'to_position')::INTEGER + 1];

    IF v_from_point_id IS NULL OR v_to_point_id IS NULL THEN
      RAISE EXCEPTION 'Invalid point positions in transit segment';
    END IF;

    INSERT INTO transit_segments (
      route_id, from_point_id, to_point_id,
      transit_type, distance_km, duration_minutes, notes
    )
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
  p_transit_segments JSONB DEFAULT '[]'::JSONB,
  p_is_favorite BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_point JSONB;
  v_segment JSONB;
  v_position INTEGER;
  v_point_id UUID;
  v_from_point_id UUID;
  v_to_point_id UUID;
  v_point_ids UUID[];
  v_user_id UUID;
BEGIN
  -- Check route exists and get owner
  SELECT user_id INTO v_user_id FROM routes WHERE id = p_route_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Route with id % does not exist', p_route_id;
  END IF;

  -- Verify the caller owns this route
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not have permission to update this route';
  END IF;

  -- Update route with is_favorite (use COALESCE to handle NULL)
  UPDATE routes
  SET
    name = p_name,
    route_description = p_route_description,
    is_favorite = COALESCE(p_is_favorite, FALSE),
    updated_at = NOW()
  WHERE id = p_route_id;

  -- Create a new LLM session snapshot
  INSERT INTO llm_sessions (
    route_id, session_route_description, constraints
  )
  VALUES (
    p_route_id, p_session_description, p_constraints
  );

  -- Delete old transit segments first (they reference route_points)
  DELETE FROM transit_segments WHERE route_id = p_route_id;

  -- Replace route points
  DELETE FROM route_points WHERE route_id = p_route_id;

  v_point_ids := ARRAY[]::UUID[];
  v_position := 0;

  FOR v_point IN SELECT * FROM jsonb_array_elements(p_route_points)
  LOOP
    INSERT INTO route_points (
      route_id, position, name, address, latitude, longitude, tags
    )
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

  -- Insert new transit segments
  FOR v_segment IN SELECT * FROM jsonb_array_elements(p_transit_segments)
  LOOP
    v_from_point_id := v_point_ids[(v_segment->>'from_position')::INTEGER + 1];
    v_to_point_id   := v_point_ids[(v_segment->>'to_position')::INTEGER + 1];

    IF v_from_point_id IS NULL OR v_to_point_id IS NULL THEN
      RAISE EXCEPTION 'Invalid point positions in transit segment';
    END IF;

    INSERT INTO transit_segments (
      route_id, from_point_id, to_point_id,
      transit_type, distance_km, duration_minutes, notes
    )
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

  RETURN TRUE;
END;
$$;

-- Grant execute permissions on the NEW function signatures (with boolean parameter)
GRANT EXECUTE ON FUNCTION create_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB, BOOLEAN) TO authenticated;

-- Ensure authenticated users can select from routes_summary view
GRANT SELECT ON routes_summary TO authenticated;
