-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "clientId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workout_userId_clientId_key" ON "Workout"("userId", "clientId");

