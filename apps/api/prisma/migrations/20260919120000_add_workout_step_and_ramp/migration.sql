-- AlterEnum
ALTER TYPE "SetType" ADD VALUE 'RAMP';

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "step" INTEGER;
