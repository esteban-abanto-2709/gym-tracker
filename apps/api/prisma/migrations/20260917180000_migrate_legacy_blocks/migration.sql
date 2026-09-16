BEGIN;

UPDATE "Workout" w SET "weight" = NULL
FROM "Exercise" e
WHERE e."id" = w."exerciseId"
  AND e."slug" IN ('dead-bug', 'terminal-knee-extension', 'fondos')
  AND w."weight" = 0;

UPDATE "Workout" SET "setType" = 'WARMUP', "isApproximation" = false
WHERE "isApproximation"
  AND (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Lima')::date < DATE '2026-09-07';

CREATE TEMP TABLE "warmup_merge" AS
SELECT w."id" AS "warmupId", n."id" AS "nextId", w."blocks"->0 AS "block"
FROM "RoutineItem" w
JOIN "RoutineItem" n
  ON n."routineId" = w."routineId"
 AND n."position" = w."position" + 1
 AND n."exerciseId" = w."exerciseId"
WHERE jsonb_array_length(w."blocks") = 1
  AND w."blocks"->0->>'kind' = 'legacy'
  AND (w."blocks"->0->>'approx')::boolean
  AND (w."blocks"->0->>'reps')::int >= 20
  AND n."blocks"->0->>'kind' = 'legacy'
  AND NOT (n."blocks"->0->>'approx')::boolean;

UPDATE "RoutineItem" n
SET "blocks" = jsonb_build_array(jsonb_build_object(
      'kind', 'warmup',
      'sets', m."block"->'sets',
      'reps', m."block"->'reps'
    )) || n."blocks"
FROM "warmup_merge" m
WHERE n."id" = m."nextId";

DELETE FROM "RoutineItem" WHERE "id" IN (SELECT "warmupId" FROM "warmup_merge");

UPDATE "RoutineItem" ri SET "position" = r."rn"
FROM (
  SELECT "id", row_number() OVER (PARTITION BY "routineId" ORDER BY "position") - 1 AS "rn"
  FROM "RoutineItem"
) r
WHERE ri."id" = r."id" AND ri."position" <> r."rn";

UPDATE "RoutineItem" ri
SET "blocks" = (
  SELECT jsonb_agg(
    CASE
      WHEN b->>'kind' <> 'legacy' THEN b
      WHEN e."isTimed" THEN jsonb_build_object(
        'kind', 'time', 'sets', b->'sets', 'durationSec', b->'durationSec')
      WHEN e."slug" IN ('dead-bug', 'terminal-knee-extension', 'fondos') THEN jsonb_build_object(
        'kind', 'reps', 'sets', b->'sets', 'reps', b->'reps')
      ELSE jsonb_build_object(
        'kind', 'weight_reps', 'sets', b->'sets', 'reps', b->'reps', 'approx', b->'approx')
    END
    ORDER BY t."ord"
  )
  FROM jsonb_array_elements(ri."blocks") WITH ORDINALITY AS t(b, "ord")
)
FROM "Exercise" e
WHERE e."id" = ri."exerciseId"
  AND ri."blocks" @> '[{"kind": "legacy"}]';

DROP TABLE "warmup_merge";

COMMIT;
