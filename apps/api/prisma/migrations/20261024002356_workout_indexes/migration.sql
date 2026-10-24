-- CreateIndex
CREATE INDEX "Workout_userId_exerciseId_createdAt_idx" ON "Workout"("userId", "exerciseId", "createdAt");

-- CreateIndex
CREATE INDEX "Workout_userId_createdAt_idx" ON "Workout"("userId", "createdAt");
