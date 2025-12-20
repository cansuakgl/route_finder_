CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE CHECK (length(trim(username)) >= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
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
  position INTEGER NOT NULL CHECK (position >= 0),
  name TEXT NOT NULL CHECK  (length(trim(name)) > 0),
  address TEXT,
  latitude DECIMAL(10, 8) CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
  longitude DECIMAL(11, 8) CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(route_id, position)
);

CREATE TYPE transit_type_enum AS ENUM (
  'walking',
  'driving',
  'public_transport',
  'cycling'
);

CREATE TABLE transit_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  from_point_id UUID NOT NULL REFERENCES route_points(id) ON DELETE CASCADE,
  to_point_id UUID NOT NULL REFERENCES route_points(id) ON DELETE CASCADE,
  transit_type transit_type_enum NOT NULL,
  distance_km DECIMAL(10, 2) CHECK (distance_km IS NULL OR (distance_km >= 0 AND distance_km <= 4000)),
  duration_minutes INTEGER CHECK (duration_minutes IS NULL OR (duration_minutes >= 0 AND duration_minutes <= 43200)),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (from_point_id != to_point_id)
);


CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_routes_user_created ON routes(user_id, created_at DESC);
CREATE INDEX idx_routes_user_updated ON routes(user_id, updated_at DESC);
CREATE INDEX idx_llm_sessions_route_id ON llm_sessions(route_id);
CREATE INDEX idx_llm_sessions_route_created ON llm_sessions(route_id, created_at DESC);
CREATE INDEX idx_llm_sessions_with_constraints ON llm_sessions(route_id, created_at DESC) WHERE constraints IS NOT NULL;
CREATE INDEX idx_route_points_route_id ON route_points(route_id);
CREATE INDEX idx_route_points_position ON route_points(route_id, position);
CREATE INDEX idx_route_points_with_coords ON route_points(route_id, position) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_transit_segments_route_id ON transit_segments(route_id);
CREATE INDEX idx_transit_segments_from_point ON transit_segments(from_point_id);
CREATE INDEX idx_transit_segments_to_point ON transit_segments(to_point_id);
CREATE INDEX idx_transit_segments_type ON transit_segments(route_id, transit_type);
CREATE INDEX idx_transit_segments_distance ON transit_segments(route_id, distance_km DESC NULLS LAST) WHERE distance_km IS NOT NULL;
