-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "isTimed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RoutineItem" ADD COLUMN     "targetDurationSec" INTEGER;

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "durationSec" INTEGER,
ALTER COLUMN "weight" DROP NOT NULL;
