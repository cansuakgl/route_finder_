-- Comprehensive fix for routes, functions, and permissions

-- 1. Ensure is_favorite column exists with correct constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'routes' 
    AND column_name = 'is_favorite'
  ) THEN
    ALTER TABLE routes ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT FALSE;
  ELSE
    -- Ensure it has a default and not null constraint
    ALTER TABLE routes ALTER COLUMN is_favorite SET DEFAULT FALSE;
    ALTER TABLE routes ALTER COLUMN is_favorite SET NOT NULL;
  END IF;
END $$;

-- Update any existing NULL values to FALSE
UPDATE routes SET is_favorite = FALSE WHERE is_favorite IS NULL;

-- 2. Drop ALL versions of create_route and update_route to start fresh
DROP FUNCTION IF EXISTS create_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS create_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB);
DROP FUNCTION IF EXISTS update_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB, BOOLEAN);
DROP FUNCTION IF EXISTS update_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB);

-- 3. Create create_route function
CREATE FUNCTION create_route(
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
  v_point JSONB;
  v_segment JSONB;
  v_point_id UUID;
  v_from_point_id UUID;
  v_to_point_id UUID;
  v_position INTEGER;
  v_point_ids UUID[];
BEGIN
  -- Verify caller is the user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only create routes for yourself';
  END IF;

  -- Insert route
  INSERT INTO routes (user_id, name, route_description, is_favorite)
  VALUES (p_user_id, p_name, p_route_description, COALESCE(p_is_favorite, FALSE))
  RETURNING id INTO v_route_id;

  -- Insert LLM session
  INSERT INTO llm_sessions (route_id, session_route_description, constraints)
  VALUES (v_route_id, p_session_description, p_constraints);

  -- Insert route points
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
        WHEN v_point->'tags' IS NOT NULL AND jsonb_typeof(v_point->'tags') = 'array' THEN
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
      RAISE EXCEPTION 'Invalid point positions in transit segment: from=%, to=%', 
        v_segment->>'from_position', v_segment->>'to_position';
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

-- 4. Create update_route function
CREATE FUNCTION update_route(
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
  -- Get route owner
  SELECT user_id INTO v_user_id FROM routes WHERE id = p_route_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Route with id % does not exist', p_route_id;
  END IF;

  -- Verify caller owns this route
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You do not have permission to update this route';
  END IF;

  -- Update route
  UPDATE routes
  SET
    name = p_name,
    route_description = p_route_description,
    is_favorite = COALESCE(p_is_favorite, FALSE),
    updated_at = NOW()
  WHERE id = p_route_id;

  -- Create LLM session snapshot
  INSERT INTO llm_sessions (route_id, session_route_description, constraints)
  VALUES (p_route_id, p_session_description, p_constraints);

  -- Delete old transit segments first (they reference route_points via FK)
  DELETE FROM transit_segments WHERE route_id = p_route_id;

  -- Delete old route points
  DELETE FROM route_points WHERE route_id = p_route_id;

  -- Insert new route points
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
        WHEN v_point->'tags' IS NOT NULL AND jsonb_typeof(v_point->'tags') = 'array' THEN
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
      RAISE EXCEPTION 'Invalid point positions in transit segment: from=%, to=%',
        v_segment->>'from_position', v_segment->>'to_position';
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

  RETURN TRUE;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION create_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB, BOOLEAN) TO authenticated;

-- 6. Recreate routes_summary view
DROP VIEW IF EXISTS routes_summary;

CREATE VIEW routes_summary
WITH (security_invoker = true)
AS
SELECT 
  r.id,
  r.user_id,
  r.name,
  r.route_description,
  r.is_favorite,
  r.created_at,
  r.updated_at,
  COUNT(DISTINCT rp.id) as point_count,
  COUNT(DISTINCT ts.id) as segment_count,
  COALESCE(SUM(ts.distance_km), 0) as total_distance_km,
  COALESCE(SUM(ts.duration_minutes), 0) as total_duration_minutes
FROM routes r
LEFT JOIN route_points rp ON rp.route_id = r.id
LEFT JOIN transit_segments ts ON ts.route_id = r.id
GROUP BY r.id, r.user_id, r.name, r.route_description, r.is_favorite, r.created_at, r.updated_at;

GRANT SELECT ON routes_summary TO authenticated;

-- 7. Ensure index for favorites
CREATE INDEX IF NOT EXISTS idx_routes_is_favorite ON routes(user_id, is_favorite) WHERE is_favorite = TRUE;
