-- Fix: Grant UPDATE permission on routes for toggleRouteFavorite
-- The RLS policy "routes_update_own" already restricts to owner only

GRANT UPDATE ON routes TO authenticated;

-- Also create a toggle_route_favorite function for safety
CREATE OR REPLACE FUNCTION toggle_route_favorite(
  p_route_id UUID,
  p_is_favorite BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
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

  -- Update is_favorite
  UPDATE routes
  SET is_favorite = p_is_favorite, updated_at = NOW()
  WHERE id = p_route_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_route_favorite(UUID, BOOLEAN) TO authenticated;
