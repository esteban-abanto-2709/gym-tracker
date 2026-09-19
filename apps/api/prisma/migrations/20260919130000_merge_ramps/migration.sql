BEGIN;

CREATE TEMP TABLE "ramp_step" AS
SELECT ri."id",
       ri."routineId",
       ri."exerciseId",
       ri."position",
       (ri."blocks"->0->>'reps')::int AS "reps"
FROM "RoutineItem" ri
WHERE jsonb_array_length(ri."blocks") = 1
  AND ri."blocks"->0->>'kind' = 'weight_reps'
  AND (ri."blocks"->0->>'approx')::boolean
  AND (ri."blocks"->0->>'sets')::int = 1;

CREATE TEMP TABLE "ramp_merge" AS
SELECT s."id" AS "stepId",
       s."position",
       s."reps",
       (
         SELECT n."id"
         FROM "RoutineItem" n
         WHERE n."routineId" = s."routineId"
           AND n."exerciseId" = s."exerciseId"
           AND n."position" > s."position"
           AND n."id" NOT IN (SELECT "id" FROM "ramp_step")
         ORDER BY n."position"
         LIMIT 1
       ) AS "workingId"
FROM "ramp_step" s;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "ramp_merge" WHERE "workingId" IS NULL) THEN
    RAISE EXCEPTION 'Hay escalones de rampa sin slot efectivo despues de ellos';
  END IF;
END $$;

UPDATE "RoutineItem" n
SET "blocks" = jsonb_build_array(
      jsonb_build_object('kind', 'ramp', 'steps', m."steps")
    ) || n."blocks"
FROM (
  SELECT "workingId",
         jsonb_agg(
           jsonb_build_object('reps', "reps", 'pct', "pct")
           ORDER BY "position"
         ) AS "steps"
  FROM (
    SELECT "workingId",
           "position",
           "reps",
           (ARRAY[50, 70, 85])[
             row_number() OVER (PARTITION BY "workingId" ORDER BY "position")
           ] AS "pct"
    FROM "ramp_merge"
  ) t
  GROUP BY "workingId"
) m
WHERE n."id" = m."workingId";

DELETE FROM "RoutineItem" WHERE "id" IN (SELECT "stepId" FROM "ramp_merge");

UPDATE "RoutineItem" ri SET "position" = r."rn"
FROM (
  SELECT "id", row_number() OVER (PARTITION BY "routineId" ORDER BY "position") - 1 AS "rn"
  FROM "RoutineItem"
) r
WHERE ri."id" = r."id" AND ri."position" <> r."rn";

UPDATE "Workout" w
SET "setType" = 'RAMP',
    "isApproximation" = false,
    "step" = r."rn"
FROM (
  SELECT "id",
         row_number() OVER (
           PARTITION BY "userId", "exerciseId", "session" ORDER BY "createdAt"
         ) AS "rn"
  FROM (
    SELECT "id",
           "userId",
           "exerciseId",
           "createdAt",
           sum(
             CASE WHEN "prev" IS NULL OR "createdAt" - "prev" > interval '6 hours'
                  THEN 1 ELSE 0 END
           ) OVER (PARTITION BY "userId", "exerciseId" ORDER BY "createdAt") AS "session"
    FROM (
      SELECT "id",
             "userId",
             "exerciseId",
             "createdAt",
             lag("createdAt") OVER (
               PARTITION BY "userId", "exerciseId" ORDER BY "createdAt"
             ) AS "prev"
      FROM "Workout"
      WHERE "isApproximation"
    ) a
  ) b
) r
WHERE w."id" = r."id";

DROP TABLE "ramp_merge";
DROP TABLE "ramp_step";

COMMIT;
