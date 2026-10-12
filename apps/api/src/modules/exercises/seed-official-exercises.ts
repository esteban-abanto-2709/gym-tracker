import type { PrismaClient } from '@prisma/client';
import { toSearchName } from '../../common/locale';
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

const LOCALES = ['en', 'es'] as const;

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

interface StoredExercise {
  mechanic: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  names: { locale: string; name: string }[];
}

function isUnchanged(stored: StoredExercise, exercise: OfficialExercise) {
  return (
    stored.mechanic === exercise.mechanic &&
    sameList(stored.primaryMuscles, exercise.primaryMuscles) &&
    sameList(stored.secondaryMuscles, exercise.secondaryMuscles) &&
    LOCALES.every(
      (locale) =>
        stored.names.find((n) => n.locale === locale)?.name ===
        exercise.names[locale],
    )
  );
}

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
    const { slug, names, ...fields } = exercise;
    const existing = await prisma.exercise.findUnique({
      where: { slug },
      include: { names: true },
    });

    if (existing?.createdById) {
      result.skipped.push(slug);
      continue;
    }
    if (existing && isUnchanged(existing, exercise)) {
      result.unchanged++;
      continue;
    }

    const saved = await prisma.exercise.upsert({
      where: { slug },
      create: { slug, ...fields },
      update: fields,
    });
    for (const locale of LOCALES) {
      const name = names[locale];
      await prisma.exerciseName.upsert({
        where: { exerciseId_locale: { exerciseId: saved.id, locale } },
        create: {
          exerciseId: saved.id,
          locale,
          name,
          searchName: toSearchName(name),
        },
        update: { name, searchName: toSearchName(name) },
      });
    }

    if (existing) result.updated++;
    else result.created++;
  }

  return result;
}
