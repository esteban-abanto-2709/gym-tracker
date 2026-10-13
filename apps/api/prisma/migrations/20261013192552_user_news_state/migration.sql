-- AlterTable
ALTER TABLE "User" ADD COLUMN     "newsOpened" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "newsSeen" TEXT[] DEFAULT ARRAY[]::TEXT[];
