-- Rename externalId to googleId in users table
-- This migration fixes the column name for Firebase Auth integration

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'users_externalid_key'
  ) THEN
    DROP INDEX "users_externalId_key";
  END IF;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "users" RENAME COLUMN "externalId" TO "googleId";
EXCEPTION WHEN undefined_column THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_key" ON "users"("googleId");
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

ALTER TABLE "users" DROP COLUMN IF EXISTS "subscriptionId";

DROP TABLE IF EXISTS "subscriptions";

DROP TYPE IF EXISTS "SubscriptionPlan";
