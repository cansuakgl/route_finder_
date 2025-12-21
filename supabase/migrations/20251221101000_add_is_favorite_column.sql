-- Add missing is_favorite column to routes table
ALTER TABLE routes ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster favorite lookups
CREATE INDEX IF NOT EXISTS idx_routes_is_favorite ON routes(user_id, is_favorite) WHERE is_favorite = TRUE;
