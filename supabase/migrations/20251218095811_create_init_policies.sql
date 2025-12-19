ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_segments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Routes policies
CREATE POLICY "Users can view their own routes"
  ON routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routes"
  ON routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes"
  ON routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes"
  ON routes FOR DELETE
  USING (auth.uid() = user_id);

-- LLM Sessions policies (through route ownership)
CREATE POLICY "Users can view sessions for their routes"
  ON llm_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = llm_sessions.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert sessions for their routes"
  ON llm_sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = llm_sessions.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update sessions for their routes"
  ON llm_sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = llm_sessions.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete sessions for their routes"
  ON llm_sessions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = llm_sessions.route_id AND routes.user_id = auth.uid()
  ));

-- Route Points policies
CREATE POLICY "Users can view points for their routes"
  ON route_points FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = route_points.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert points for their routes"
  ON route_points FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = route_points.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update points for their routes"
  ON route_points FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = route_points.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete points for their routes"
  ON route_points FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = route_points.route_id AND routes.user_id = auth.uid()
  ));

-- Transit Segments policies
CREATE POLICY "Users can view segments for their routes"
  ON transit_segments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = transit_segments.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert segments for their routes"
  ON transit_segments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = transit_segments.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update segments for their routes"
  ON transit_segments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = transit_segments.route_id AND routes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete segments for their routes"
  ON transit_segments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM routes WHERE routes.id = transit_segments.route_id AND routes.user_id = auth.uid()
  ));
