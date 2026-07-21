-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- Seed owner account (existing data belongs to this user)
INSERT INTO "User" ("id", "email", "username", "slug", "passwordHash", "createdAt")
VALUES (
    'e604abcb-6b7c-40b5-aaf0-8d23873bb03d',
    'esteban.abanto.2709@gmail.com',
    'EstebanAbanto',
    'estebanabanto',
    '$2b$10$6fdI20KXS2pBhFg2IvlJI.t06OIOVdtRkfCb7T7469QM.X3rd4QjS',
    CURRENT_TIMESTAMP
);

-- AlterTable: Workout.userId (add nullable, backfill, enforce)
ALTER TABLE "Workout" ADD COLUMN "userId" TEXT;
UPDATE "Workout" SET "userId" = 'e604abcb-6b7c-40b5-aaf0-8d23873bb03d';
ALTER TABLE "Workout" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable: Routine.userId (add nullable, backfill, enforce)
ALTER TABLE "Routine" ADD COLUMN "userId" TEXT;
UPDATE "Routine" SET "userId" = 'e604abcb-6b7c-40b5-aaf0-8d23873bb03d';
ALTER TABLE "Routine" ALTER COLUMN "userId" SET NOT NULL;

-- Routine name uniqueness is now per-user, not global
DROP INDEX "Routine_name_key";
CREATE UNIQUE INDEX "Routine_userId_name_key" ON "Routine"("userId", "name");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
