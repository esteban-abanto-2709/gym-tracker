UPDATE "Workout"
SET "setType" = 'WARMUP',
    "opinion" = trim(regexp_replace("opinion", '^\s*aproximaciones\s*,?\s*', '', 'i'))
WHERE "setType" = 'WORKING'
  AND "opinion" ~* '^\s*aproximaciones';
