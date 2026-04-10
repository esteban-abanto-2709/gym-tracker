/*
  Warnings:

  - You are about to drop the column `description` on the `Workout` table. All the data in the column will be lost.
  - You are about to drop the column `exercise` on the `Workout` table. All the data in the column will be lost.
  - Added the required column `exerciseId` to the `Workout` table without a default value. This is not possible if the table is not empty.

*/
-- 1. CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- 2. CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- 3. Inyectar datos antiguos a la nueva tabla Exercise (Custom Data Migration)
-- Usamos TRIM() para limpiar espacios como pediste, y agrupamos para evitar duplicados.
-- Usamos MAX() para que PostgreSQL nos permita traer la descripción.
INSERT INTO "Exercise" ("id", "name", "equipment", "createdAt")
SELECT 
    gen_random_uuid()::text, 
    TRIM("exercise"), 
    COALESCE(NULLIF(TRIM(MAX("description")), ''), 'Sin asignar'), 
    CURRENT_TIMESTAMP
FROM "Workout"
GROUP BY TRIM("exercise");

-- 4. Modificar la tabla Workout: Agregamos la columna de forma opcional primero
ALTER TABLE "Workout" ADD COLUMN "exerciseId" TEXT;

-- 5. Llenar la nueva columna de Workout cruzando los datos por el texto
UPDATE "Workout" w
SET "exerciseId" = e."id"
FROM "Exercise" e
WHERE TRIM(w."exercise") = e."name";

-- 6. Hacer que la columna sea obligatoria (NOT NULL) ahora que toda fila tiene datos
ALTER TABLE "Workout" ALTER COLUMN "exerciseId" SET NOT NULL;

-- 7. Borrar de forma segura las columnas antiguas que ya no necesitamos
ALTER TABLE "Workout" 
DROP COLUMN "description",
DROP COLUMN "exercise";

-- 8. Añadir la restricción de Foreign Key
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
