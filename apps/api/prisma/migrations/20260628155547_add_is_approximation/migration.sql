-- AlterTable
ALTER TABLE "RoutineItem" ADD COLUMN     "isApproximation" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "isApproximation" BOOLEAN NOT NULL DEFAULT false;
