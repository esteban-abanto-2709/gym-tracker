-- UpdateData
UPDATE "User" SET "interfaceLocale" = 'es' WHERE "interfaceLocale" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "interfaceLocale" SET NOT NULL,
ALTER COLUMN "interfaceLocale" SET DEFAULT 'en';
