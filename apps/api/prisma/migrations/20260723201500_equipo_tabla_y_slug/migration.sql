-- 1. Tabla Equipment + seed. El seed va DENTRO de la migración para que prod
--    lo tenga al correr `migrate deploy` (docker compose up --build). Ids fijos
--    para que dev y prod sean idénticos y el front mapee iconos por clave estable.
CREATE TABLE "Equipment" (
  "id"   TEXT NOT NULL,
  "name" TEXT NOT NULL,
  CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Equipment_name_key" ON "Equipment"("name");
INSERT INTO "Equipment" ("id", "name") VALUES
  ('barra',         'Barra'),
  ('polea',         'Polea'),
  ('mancuerna',     'Mancuerna'),
  ('maquina',       'Máquina'),
  ('peso-corporal', 'Peso Corporal'),
  ('otro',          'Otro');

-- 2. Workout.equipmentId (nullable = "sin especificar") + FK.
--    Backfill desde el equipo actual del Exercise (antes de fusionar, así cada
--    set conserva su equipo real). Un equipo que no matchee queda NULL.
ALTER TABLE "Workout" ADD COLUMN "equipmentId" TEXT;
UPDATE "Workout" w SET "equipmentId" = eq."id"
FROM "Exercise" e
JOIN "Equipment" eq ON eq."name" = e."equipment"
WHERE w."exerciseId" = e."id";
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Exercise.slug (temporalmente nullable) + backfill slugify(name).
ALTER TABLE "Exercise" ADD COLUMN "slug" TEXT;
UPDATE "Exercise" SET "slug" = trim(both '-' from
  lower(regexp_replace(
    translate(trim(name), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'),
    '[^a-zA-Z0-9]+', '-', 'g')));

-- 4. Fusionar ejercicios que colapsan al mismo slug (misma identidad, distinto
--    equipo). Sobrevive el de nombre con mayúsculas y, en empate, el de más
--    workouts; se repuntan Workout/RoutineItem (cada set ya lleva su equipo).
DO $$
DECLARE
  grp    record;
  winner text;
  losers text[];
BEGIN
  FOR grp IN
    SELECT slug FROM "Exercise" GROUP BY slug HAVING count(*) > 1
  LOOP
    SELECT e.id INTO winner
    FROM "Exercise" e
    WHERE e.slug = grp.slug
    ORDER BY (e.name <> lower(e.name)) DESC,
             (SELECT count(*) FROM "Workout" w WHERE w."exerciseId" = e.id) DESC,
             e."createdAt" ASC
    LIMIT 1;

    SELECT array_agg(e.id) INTO losers
    FROM "Exercise" e WHERE e.slug = grp.slug AND e.id <> winner;

    UPDATE "Workout"     SET "exerciseId" = winner WHERE "exerciseId" = ANY(losers);
    UPDATE "RoutineItem" SET "exerciseId" = winner WHERE "exerciseId" = ANY(losers);
    DELETE FROM "Exercise" WHERE id = ANY(losers);
  END LOOP;
END $$;

-- 5. Quitar equipment del Exercise (su índice funcional de RM-025 cae con la columna).
DROP INDEX IF EXISTS "Exercise_name_equipment_key";
ALTER TABLE "Exercise" DROP COLUMN "equipment";

-- 6. Slug definitivo: NOT NULL + único.
ALTER TABLE "Exercise" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");
