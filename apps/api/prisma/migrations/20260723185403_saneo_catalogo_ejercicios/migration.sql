-- 1. Normalizar nombre (trim) y equipo a la lista canónica.
--    Cualquier equipo desconocido cae en 'Sin asignar'.
UPDATE "Exercise" SET name = trim(name);

UPDATE "Exercise" SET equipment = CASE lower(trim(equipment))
  WHEN 'máquina'       THEN 'Máquina'
  WHEN 'maquina'       THEN 'Máquina'
  WHEN 'mancuerna'     THEN 'Mancuerna'
  WHEN 'mancuernas'    THEN 'Mancuerna'
  WHEN 'barra'         THEN 'Barra'
  WHEN 'polea'         THEN 'Polea'
  WHEN 'peso corporal' THEN 'Peso Corporal'
  WHEN 'sin asignar'   THEN 'Sin asignar'
  WHEN 'otro'          THEN 'Otro'
  ELSE 'Sin asignar'
END;

-- 2. Fusionar duplicados por (lower(name), equipment): gana el de más
--    workouts (empate -> más antiguo); se repuntan las FK y se borra el resto.
DO $$
DECLARE
  grp    record;
  winner text;
  losers text[];
BEGIN
  FOR grp IN
    SELECT lower(name) AS nk, equipment
    FROM "Exercise"
    GROUP BY lower(name), equipment
    HAVING count(*) > 1
  LOOP
    SELECT e.id INTO winner
    FROM "Exercise" e
    WHERE lower(e.name) = grp.nk AND e.equipment = grp.equipment
    ORDER BY (SELECT count(*) FROM "Workout" w WHERE w."exerciseId" = e.id) DESC,
             e."createdAt" ASC
    LIMIT 1;

    SELECT array_agg(e.id) INTO losers
    FROM "Exercise" e
    WHERE lower(e.name) = grp.nk AND e.equipment = grp.equipment
      AND e.id <> winner;

    UPDATE "Workout"     SET "exerciseId" = winner WHERE "exerciseId" = ANY(losers);
    UPDATE "RoutineItem" SET "exerciseId" = winner WHERE "exerciseId" = ANY(losers);
    DELETE FROM "Exercise" WHERE id = ANY(losers);
  END LOOP;
END $$;

-- DropIndex
DROP INDEX "Exercise_name_key";

-- 3. Unicidad case-insensitive por (nombre, equipo).
CREATE UNIQUE INDEX "Exercise_name_equipment_key" ON "Exercise" (lower(name), equipment);
