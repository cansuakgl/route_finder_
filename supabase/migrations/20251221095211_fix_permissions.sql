GRANT EXECUTE ON FUNCTION create_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_route(UUID, TEXT, TEXT, TEXT, TEXT[], JSONB, JSONB) TO authenticated;

GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON routes TO authenticated;
GRANT SELECT ON route_points TO authenticated;
GRANT SELECT ON transit_segments TO authenticated;
GRANT SELECT ON llm_sessions TO authenticated;

GRANT DELETE ON routes TO authenticated;

REVOKE INSERT, UPDATE ON routes FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON route_points FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON llm_sessions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON transit_segments FROM authenticated;