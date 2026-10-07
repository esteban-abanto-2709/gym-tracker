BEGIN;

UPDATE "Workout"
SET "setType" = 'WARMUP'
WHERE "isApproximation" AND "setType" = 'WORKING';

UPDATE "RoutineItem" ri
SET "blocks" = (
  SELECT jsonb_agg(
    CASE
      WHEN b->>'kind' = 'weight_reps' AND (b->>'approx')::boolean
        THEN jsonb_build_object('kind', 'warmup', 'sets', b->'sets', 'reps', b->'reps')
      ELSE b - 'approx'
    END
    ORDER BY i
  )
  FROM jsonb_array_elements(ri."blocks") WITH ORDINALITY AS e(b, i)
)
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(ri."blocks") b WHERE b ? 'approx'
);

ALTER TABLE "Workout" DROP COLUMN "isApproximation";

COMMIT;
