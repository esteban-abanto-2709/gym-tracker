import type { PrismaClient } from '@prisma/client';
import { slugify } from '../../common/slugify';
import {
  OFFICIAL_EXERCISES,
  type OfficialExercise,
} from './official-exercises';
import { seedOfficialExercises } from './seed-official-exercises';

type Row = OfficialExercise & { createdById: string | null };

function fakePrisma(rows: Row[]) {
  const exercise = {
    findUnique: jest.fn(({ where }: { where: { slug: string } }) =>
      Promise.resolve(rows.find((r) => r.slug === where.slug) ?? null),
    ),
    create: jest.fn(({ data }: { data: OfficialExercise }) => {
      rows.push({ ...data, createdById: null });
      return Promise.resolve(data);
    }),
    update: jest.fn(
      ({
        where,
        data,
      }: {
        where: { slug: string };
        data: OfficialExercise;
      }) => {
        Object.assign(rows.find((r) => r.slug === where.slug)!, data);
        return Promise.resolve(data);
      },
    ),
  };
  return { exercise } as unknown as PrismaClient & {
    exercise: typeof exercise;
  };
}

const bench: OfficialExercise = {
  slug: 'bench-press',
  name: 'Bench Press',
  primaryMuscles: ['CHEST'],
  secondaryMuscles: ['FRONT_DELTS', 'TRICEPS'],
  mechanic: 'COMPOUND',
};
const squat: OfficialExercise = {
  slug: 'squat',
  name: 'Squat',
  primaryMuscles: ['QUADRICEPS'],
  secondaryMuscles: ['GLUTES'],
  mechanic: 'COMPOUND',
};

describe('OFFICIAL_EXERCISES', () => {
  it('has unique, well-formed slugs', () => {
    const slugs = OFFICIAL_EXERCISES.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slugify(slug)).toBe(slug);
  });

  it('has unique names', () => {
    const names = OFFICIAL_EXERCISES.map((e) => e.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every exercise a primary muscle not repeated as secondary', () => {
    for (const e of OFFICIAL_EXERCISES) {
      expect(e.primaryMuscles.length).toBeGreaterThan(0);
      expect(
        e.secondaryMuscles.filter((m) => e.primaryMuscles.includes(m)),
      ).toEqual([]);
    }
  });
});

describe('seedOfficialExercises', () => {
  it('creates missing exercises and changes nothing on a second run', async () => {
    const prisma = fakePrisma([]);

    const first = await seedOfficialExercises(prisma, [bench, squat]);
    expect(first).toEqual({
      created: 2,
      updated: 0,
      unchanged: 0,
      skipped: [],
    });

    const second = await seedOfficialExercises(prisma, [bench, squat]);
    expect(second).toEqual({
      created: 0,
      updated: 0,
      unchanged: 2,
      skipped: [],
    });
  });

  it('updates an official exercise whose data changed', async () => {
    const prisma = fakePrisma([
      { ...bench, mechanic: 'ISOLATION', createdById: null },
    ]);

    const result = await seedOfficialExercises(prisma, [bench]);

    expect(result.updated).toBe(1);
    expect(prisma.exercise.update).toHaveBeenCalledWith({
      where: { slug: 'bench-press' },
      data: bench,
    });
  });

  it('skips and never touches a user exercise with the same slug', async () => {
    const prisma = fakePrisma([
      {
        slug: 'bench-press',
        name: 'Bench Press',
        primaryMuscles: [],
        secondaryMuscles: [],
        mechanic: 'ISOLATION',
        createdById: 'user-1',
      },
    ]);

    const result = await seedOfficialExercises(prisma, [bench]);

    expect(result.skipped).toEqual(['bench-press']);
    expect(prisma.exercise.update).not.toHaveBeenCalled();
    expect(prisma.exercise.create).not.toHaveBeenCalled();
  });
});
