-- AlterTable
ALTER TABLE "RoutineItem" ADD COLUMN     "blocks" JSONB NOT NULL DEFAULT '[]';

UPDATE "RoutineItem" SET "blocks" = jsonb_build_array(jsonb_build_object(
  'kind',        'legacy',
  'sets',        "targetSets",
  'reps',        "targetReps",
  'durationSec', "targetDurationSec",
  'approx',      "isApproximation"
));
