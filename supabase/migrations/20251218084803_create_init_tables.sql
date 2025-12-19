CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE CHECK (length(trim(username)) > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  route_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() 
);

CREATE TABLE llm_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  session_route_description TEXT,
  constraints TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE route_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, position)
);

CREATE TABLE transit_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  from_point_id UUID NOT NULL REFERENCES route_points(id) ON DELETE CASCADE,
  to_point_id UUID NOT NULL REFERENCES route_points(id) ON DELETE CASCADE,
  transit_type TEXT NOT NULL,
  distance_km DECIMAL(10, 2),
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() 
  CHECK (from_point_id != to_point_id)
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_llm_sessions_route_id ON llm_sessions(route_id);
CREATE INDEX idx_route_points_route_id ON route_points(route_id);
CREATE INDEX idx_route_points_position ON route_points(route_id, position);
CREATE INDEX idx_transit_segments_route_id ON transit_segments(route_id);
CREATE INDEX idx_transit_segments_from_point ON transit_segments(from_point_id);
CREATE INDEX idx_transit_segments_to_point ON transit_segments(to_point_id);