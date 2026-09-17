DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "RoutineItem" WHERE "blocks" @> '[{"kind": "legacy"}]') THEN
    RAISE EXCEPTION 'RoutineItem still has legacy blocks; run 20260917180000_migrate_legacy_blocks first';
  END IF;
END $$;

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "isTimed";
