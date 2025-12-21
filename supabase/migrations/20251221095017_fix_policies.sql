ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routes_update_own" ON routes;

CREATE POLICY "routes_update_own"
ON routes
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

