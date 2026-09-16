-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('WORKING', 'WARMUP');

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "setType" "SetType" NOT NULL DEFAULT 'WORKING';
