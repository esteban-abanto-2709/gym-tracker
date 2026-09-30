-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeProgramId" TEXT;

-- AlterTable
ALTER TABLE "Routine" ADD COLUMN     "programId" TEXT,
ADD COLUMN     "programPosition" INTEGER;

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_userId_name_key" ON "Program"("userId", "name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeProgramId_fkey" FOREIGN KEY ("activeProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
