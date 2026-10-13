-- AlterTable
ALTER TABLE "User" RENAME COLUMN "locale" TO "exerciseLocale";
UPDATE "User" SET "exerciseLocale" = 'en' WHERE "exerciseLocale" IS NULL;
ALTER TABLE "User" ALTER COLUMN "exerciseLocale" SET DEFAULT 'en',
  ALTER COLUMN "exerciseLocale" SET NOT NULL;
