-- CreateEnum
CREATE TYPE "PublicationKind" AS ENUM ('ROUTINE', 'PROGRAM');

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "kind" "PublicationKind" NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationRoutine" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PublicationRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationRoutineItem" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "blocks" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "PublicationRoutineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationLike" (
    "userId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicationLike_pkey" PRIMARY KEY ("userId","publicationId")
);

-- CreateTable
CREATE TABLE "PublicationCopy" (
    "userId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicationCopy_pkey" PRIMARY KEY ("userId","publicationId")
);

-- CreateIndex
CREATE INDEX "Publication_authorId_idx" ON "Publication"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_kind_slug_key" ON "Publication"("kind", "slug");

-- CreateIndex
CREATE INDEX "PublicationRoutine_publicationId_idx" ON "PublicationRoutine"("publicationId");

-- CreateIndex
CREATE INDEX "PublicationRoutineItem_routineId_idx" ON "PublicationRoutineItem"("routineId");

-- CreateIndex
CREATE INDEX "PublicationLike_publicationId_idx" ON "PublicationLike"("publicationId");

-- CreateIndex
CREATE INDEX "PublicationCopy_publicationId_idx" ON "PublicationCopy"("publicationId");

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationRoutine" ADD CONSTRAINT "PublicationRoutine_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationRoutineItem" ADD CONSTRAINT "PublicationRoutineItem_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "PublicationRoutine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationRoutineItem" ADD CONSTRAINT "PublicationRoutineItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationLike" ADD CONSTRAINT "PublicationLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationLike" ADD CONSTRAINT "PublicationLike_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationCopy" ADD CONSTRAINT "PublicationCopy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicationCopy" ADD CONSTRAINT "PublicationCopy_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
