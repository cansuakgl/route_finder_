-- Fix existing routes that have NULL is_favorite values
UPDATE routes SET is_favorite = FALSE WHERE is_favorite IS NULL;

-- Make absolutely sure the column has the right constraints
ALTER TABLE routes ALTER COLUMN is_favorite SET DEFAULT FALSE;
ALTER TABLE routes ALTER COLUMN is_favorite SET NOT NULL;
