-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('es', 'en');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" "Locale";

-- CreateTable
CREATE TABLE "ExerciseName" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "searchName" TEXT NOT NULL,

    CONSTRAINT "ExerciseName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseName_searchName_idx" ON "ExerciseName"("searchName");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseName_exerciseId_locale_key" ON "ExerciseName"("exerciseId", "locale");

-- AddForeignKey
ALTER TABLE "ExerciseName" ADD CONSTRAINT "ExerciseName_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ExerciseName" ("id", "exerciseId", "locale", "name", "searchName")
SELECT gen_random_uuid()::text,
       e."id",
       CASE WHEN e."createdById" IS NULL THEN 'en'::"Locale" ELSE 'es'::"Locale" END,
       e."name",
       translate(lower(btrim(e."name")), 'áàâäéèêëíìîïóòôöúùûüñç', 'aaaaeeeeiiiioooouuuunc')
FROM "Exercise" e;
