import type { PrismaClient } from '@prisma/client';
import {
  OFFICIAL_EXERCISES,
  type OfficialExercise,
} from './official-exercises';

export interface SeedResult {
  created: number;
  updated: number;
  unchanged: number;
  skipped: string[];
}

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export async function seedOfficialExercises(
  prisma: PrismaClient,
  exercises: OfficialExercise[] = OFFICIAL_EXERCISES,
): Promise<SeedResult> {
  const result: SeedResult = {
    created: 0,
    updated: 0,
    unchanged: 0,
    skipped: [],
  };

  for (const exercise of exercises) {
    const { slug } = exercise;
    const existing = await prisma.exercise.findUnique({ where: { slug } });

    if (!existing) {
      await prisma.exercise.create({ data: exercise });
      result.created++;
    } else if (existing.createdById) {
      result.skipped.push(slug);
    } else if (
      existing.name === exercise.name &&
      existing.mechanic === exercise.mechanic &&
      sameList(existing.primaryMuscles, exercise.primaryMuscles) &&
      sameList(existing.secondaryMuscles, exercise.secondaryMuscles)
    ) {
      result.unchanged++;
    } else {
      await prisma.exercise.update({ where: { slug }, data: exercise });
      result.updated++;
    }
  }

  return result;
}
