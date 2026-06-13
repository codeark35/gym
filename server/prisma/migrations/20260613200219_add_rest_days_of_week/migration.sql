-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "restDaysOfWeek" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
