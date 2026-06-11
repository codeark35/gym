-- Add imageUrl column to exercises table (safe re-run)
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
