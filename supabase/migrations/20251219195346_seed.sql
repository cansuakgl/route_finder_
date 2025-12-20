DO $$
DECLARE
  v_user_ids UUID[] := ARRAY[]::UUID[];
  v_route_ids UUID[] := ARRAY[]::UUID[];
  v_point_ids UUID[] := ARRAY[]::UUID[];
  v_user_id UUID;
  v_route_id UUID;
  v_point_id UUID;
  v_prev_point_id UUID;
  i INTEGER;
  j INTEGER;
  k INTEGER;
  v_num_users INTEGER := 5;
  v_routes_per_user INTEGER;
  v_points_per_route INTEGER;
  v_route_names TEXT[] := ARRAY['City Walk', 'Food Tour', 'Museum Day', 'Park Hopping', 'Night Life', 'Shopping Spree', 'Historic Sites', 'Beach Day', 'Mountain Hike', 'Cultural Tour'];
  v_point_names TEXT[] := ARRAY['Central Station', 'Main Square', 'Old Town', 'Harbor View', 'City Park', 'Art Gallery', 'Local Market', 'Cathedral', 'Viewpoint', 'Riverside', 'University', 'Theater District', 'Garden', 'Monument', 'Bridge'];
  v_constraints_list TEXT[][] := ARRAY[
    ARRAY['walkable', 'budget-friendly'],
    ARRAY['scenic', 'photography'],
    ARRAY['family-friendly', 'accessible'],
    ARRAY['foodie', 'local cuisine'],
    ARRAY['historic', 'cultural']
  ];
  v_selected_constraints TEXT[];
  v_transit_types transit_type_enum[] := ARRAY['walking', 'driving', 'public_transport', 'cycling']::transit_type_enum[];
  v_tags_list TEXT[][] := ARRAY[
    ARRAY['popular', 'must-see'],
    ARRAY['hidden-gem', 'local'],
    ARRAY['scenic', 'photo-spot'],
    ARRAY['food', 'drinks'],
    ARRAY['historic', 'cultural']
  ];
  v_selected_tags TEXT[];
BEGIN

  FOR i IN 1..v_num_users LOOP
    INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'user' || i || '_' || floor(random() * 1000)::text || '@example.com',
      jsonb_build_object('username', 'user_' || i || '_' || substr(md5(random()::text), 1, 6)),
      NOW() - (random() * interval '90 days'),
      NOW()
    )
    RETURNING id INTO v_user_id;
    v_user_ids := array_append(v_user_ids, v_user_id);
  END LOOP;

  FOREACH v_user_id IN ARRAY v_user_ids LOOP
    v_routes_per_user := 2 + floor(random() * 4)::integer;
    
    FOR j IN 1..v_routes_per_user LOOP
      INSERT INTO routes (user_id, name, route_description, created_at, updated_at)
      VALUES (
        v_user_id,
        v_route_names[1 + floor(random() * array_length(v_route_names, 1))::integer] || ' #' || j,
        'Auto-generated route description ' || substr(md5(random()::text), 1, 16),
        NOW() - (random() * interval '60 days'),
        NOW() - (random() * interval '7 days')
      )
      RETURNING id INTO v_route_id;
      v_route_ids := array_append(v_route_ids, v_route_id);

      -- Select random constraints
      v_selected_constraints := v_constraints_list[1 + floor(random() * array_length(v_constraints_list, 1))::integer];

      INSERT INTO llm_sessions (route_id, session_route_description, constraints, created_at)
      VALUES (
        v_route_id,
        'Session for route exploration',
        v_selected_constraints,
        NOW() - (random() * interval '30 days')
      );

      v_points_per_route := 3 + floor(random() * 5)::integer;
      v_point_ids := ARRAY[]::UUID[];
      
      FOR k IN 0..(v_points_per_route - 1) LOOP
        -- Select random tags
        v_selected_tags := v_tags_list[1 + floor(random() * array_length(v_tags_list, 1))::integer];
        
        INSERT INTO route_points (route_id, position, name, address, latitude, longitude, tags, created_at)
        VALUES (
          v_route_id,
          k,
          v_point_names[1 + floor(random() * array_length(v_point_names, 1))::integer] || ' ' || (k + 1),
          floor(random() * 999)::text || ' Street ' || chr(65 + floor(random() * 26)::integer),
          -90 + random() * 180,
          -180 + random() * 360,
          v_selected_tags,
          NOW() - (random() * interval '30 days')
        )
        RETURNING id INTO v_point_id;
        v_point_ids := array_append(v_point_ids, v_point_id);
      END LOOP;

  
      FOR k IN 1..(array_length(v_point_ids, 1) - 1) LOOP
        INSERT INTO transit_segments (route_id, from_point_id, to_point_id, transit_type, distance_km, duration_minutes, notes, created_at)
        VALUES (
          v_route_id,
          v_point_ids[k],
          v_point_ids[k + 1],
          v_transit_types[1 + floor(random() * array_length(v_transit_types, 1))::integer],
          round((0.5 + random() * 15)::numeric, 2),
          5 + floor(random() * 60)::integer,
          CASE WHEN random() > 0.5 THEN 'Via main road' ELSE NULL END,
          NOW() - (random() * interval '30 days')
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
