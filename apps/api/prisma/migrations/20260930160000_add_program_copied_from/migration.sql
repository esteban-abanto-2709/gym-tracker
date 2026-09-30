-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "copiedFromId" TEXT;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
