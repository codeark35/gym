-- Rename externalId to googleId in users table
-- This migration fixes the column name for Firebase Auth integration

-- Drop existing unique index on externalId if exists
DROP INDEX IF EXISTS "users_externalId_key";

-- Rename column
ALTER TABLE "users" RENAME COLUMN "externalId" TO "googleId";

-- Add unique index on googleId
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- Drop subscriptionId column if exists (subscriptions are removed)
ALTER TABLE "users" DROP COLUMN IF EXISTS "subscriptionId";

-- Drop subscriptions table if exists
DROP TABLE IF EXISTS "subscriptions";

-- Drop SubscriptionPlan enum if exists
DROP TYPE IF EXISTS "SubscriptionPlan";
