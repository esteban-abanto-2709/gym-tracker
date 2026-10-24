-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "routineId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_userId_startedAt_idx" ON "Session"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_clientId_key" ON "Session"("userId", "clientId");

-- CreateIndex
CREATE INDEX "Workout_sessionId_idx" ON "Workout"("sessionId");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TEMP TABLE "_set_session" AS
SELECT
  "id",
  "userId",
  "createdAt",
  "routineId",
  SUM("starts") OVER (PARTITION BY "userId" ORDER BY "createdAt", "id") AS "n"
FROM (
  SELECT
    "id",
    "userId",
    "createdAt",
    "routineId",
    CASE
      WHEN "createdAt" - LAG("createdAt") OVER (PARTITION BY "userId" ORDER BY "createdAt", "id") <= INTERVAL '3 hours' THEN 0
      ELSE 1
    END AS "starts"
  FROM "Workout"
) AS "gaps";

CREATE TEMP TABLE "_session" AS
SELECT
  gen_random_uuid()::text AS "id",
  "userId",
  "n",
  min("createdAt") AS "startedAt",
  max("createdAt") AS "endedAt",
  (array_agg("routineId" ORDER BY "createdAt") FILTER (WHERE "routineId" IS NOT NULL))[1] AS "routineId"
FROM "_set_session"
GROUP BY "userId", "n";

INSERT INTO "Session" ("id", "userId", "routineId", "startedAt", "endedAt", "timeZone", "createdAt")
SELECT "id", "userId", "routineId", "startedAt", "endedAt", 'America/Lima', "startedAt"
FROM "_session";

UPDATE "Workout" AS w
SET "sessionId" = s."id"
FROM "_set_session" AS ss
JOIN "_session" AS s ON s."userId" = ss."userId" AND s."n" = ss."n"
WHERE w."id" = ss."id";

DROP TABLE "_set_session";
DROP TABLE "_session";
