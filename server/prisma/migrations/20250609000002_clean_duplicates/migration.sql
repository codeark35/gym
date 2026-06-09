-- Clean duplicate exercises keeping only the first one (lowest id)
DELETE FROM exercises a
WHERE a.id NOT IN (
  SELECT MIN(id)
  FROM exercises b
  WHERE b.name = a.name AND b.user_id IS NOT DISTINCT FROM a.user_id
  GROUP BY b.name, b.user_id
)
AND a.is_global = true;

-- Add unique constraint if not exists (should already be there from schema)
-- This is a safety measure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'exercises_name_userId_key'
  ) THEN
    CREATE UNIQUE INDEX "exercises_name_userId_key" ON exercises(name, user_id);
  END IF;
END $$;
