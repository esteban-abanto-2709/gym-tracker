-- CreateEnum
CREATE TYPE "Muscle" AS ENUM ('ABDOMINALS', 'ABDUCTORS', 'ADDUCTORS', 'BICEPS', 'CALVES', 'CHEST', 'FOREARMS', 'GLUTES', 'HAMSTRINGS', 'LATS', 'LOWER_BACK', 'MIDDLE_BACK', 'NECK', 'QUADRICEPS', 'TRAPS', 'TRICEPS', 'FRONT_DELTS', 'SIDE_DELTS', 'REAR_DELTS');

-- CreateEnum
CREATE TYPE "Mechanic" AS ENUM ('COMPOUND', 'ISOLATION');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "mechanic" "Mechanic",
ADD COLUMN     "primaryMuscles" "Muscle"[] DEFAULT ARRAY[]::"Muscle"[],
ADD COLUMN     "secondaryMuscles" "Muscle"[] DEFAULT ARRAY[]::"Muscle"[];

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE "Exercise" e SET "createdById" = COALESCE(
  (SELECT w."userId" FROM "Workout" w WHERE w."exerciseId" = e."id" ORDER BY w."createdAt" LIMIT 1),
  (SELECT r."userId" FROM "RoutineItem" ri JOIN "Routine" r ON r."id" = ri."routineId" WHERE ri."exerciseId" = e."id" ORDER BY ri."createdAt" LIMIT 1),
  (SELECT u."id" FROM "User" u ORDER BY u."createdAt" LIMIT 1)
);
