import type { PrismaClient } from '@prisma/client';
import { slugify } from '../../common/slugify';
import {
  OFFICIAL_EXERCISES,
  type OfficialExercise,
} from './official-exercises';
import { seedOfficialExercises } from './seed-official-exercises';

interface NameRow {
  exerciseId: string;
  locale: string;
  name: string;
  searchName: string;
}
interface Row {
  id: string;
  slug: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  mechanic: string | null;
  createdById: string | null;
}

function fakePrisma(rows: Row[], nameRows: NameRow[] = []) {
  const exercise = {
    findUnique: jest.fn(({ where }: { where: { slug: string } }) => {
      const row = rows.find((r) => r.slug === where.slug);
      return Promise.resolve(
        row
          ? { ...row, names: nameRows.filter((n) => n.exerciseId === row.id) }
          : null,
      );
    }),
    upsert: jest.fn(
      ({
        where,
        create,
        update,
      }: {
        where: { slug: string };
        create: Omit<Row, 'id' | 'createdById'>;
        update: Partial<Row>;
      }) => {
        let row = rows.find((r) => r.slug === where.slug);
        if (row) Object.assign(row, update);
        else {
          row = { ...create, id: create.slug, createdById: null };
          rows.push(row);
        }
        return Promise.resolve(row);
      },
    ),
  };
  const exerciseName = {
    upsert: jest.fn(
      ({
        where,
        create,
        update,
      }: {
        where: { exerciseId_locale: { exerciseId: string; locale: string } };
        create: NameRow;
        update: Partial<NameRow>;
      }) => {
        const { exerciseId, locale } = where.exerciseId_locale;
        const row = nameRows.find(
          (n) => n.exerciseId === exerciseId && n.locale === locale,
        );
        if (row) Object.assign(row, update);
        else nameRows.push(create);
        return Promise.resolve(row ?? create);
      },
    ),
  };
  return { exercise, exerciseName } as unknown as PrismaClient & {
    exercise: typeof exercise;
    exerciseName: typeof exerciseName;
  };
}

const bench: OfficialExercise = {
  slug: 'bench-press',
  names: { en: 'Bench Press', es: 'Press de banca' },
  primaryMuscles: ['CHEST'],
  secondaryMuscles: ['FRONT_DELTS', 'TRICEPS'],
  mechanic: 'COMPOUND',
};
const squat: OfficialExercise = {
  slug: 'squat',
  names: { en: 'Squat', es: 'Sentadilla' },
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

  it('has unique names in each language', () => {
    for (const locale of ['en', 'es'] as const) {
      const names = OFFICIAL_EXERCISES.map((e) =>
        e.names[locale].toLowerCase(),
      );
      expect(new Set(names).size).toBe(names.length);
    }
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
  it('creates missing exercises with both names and changes nothing on a second run', async () => {
    const nameRows: NameRow[] = [];
    const prisma = fakePrisma([], nameRows);

    const first = await seedOfficialExercises(prisma, [bench, squat]);
    expect(first).toEqual({
      created: 2,
      updated: 0,
      unchanged: 0,
      skipped: [],
    });
    expect(nameRows).toContainEqual({
      exerciseId: 'bench-press',
      locale: 'es',
      name: 'Press de banca',
      searchName: 'press de banca',
    });
    expect(nameRows).toHaveLength(4);

    const second = await seedOfficialExercises(prisma, [bench, squat]);
    expect(second).toEqual({
      created: 0,
      updated: 0,
      unchanged: 2,
      skipped: [],
    });
  });

  it('updates an official exercise when its Spanish name changes', async () => {
    const nameRows: NameRow[] = [];
    const prisma = fakePrisma([], nameRows);
    await seedOfficialExercises(prisma, [bench]);

    const renamed = { ...bench, names: { ...bench.names, es: 'Press banca' } };
    const result = await seedOfficialExercises(prisma, [renamed]);

    expect(result.updated).toBe(1);
    expect(nameRows.find((n) => n.locale === 'es')?.name).toBe('Press banca');
  });

  it('skips and never touches a user exercise with the same slug', async () => {
    const prisma = fakePrisma([
      {
        id: 'mine',
        slug: 'bench-press',
        primaryMuscles: [],
        secondaryMuscles: [],
        mechanic: 'ISOLATION',
        createdById: 'user-1',
      },
    ]);

    const result = await seedOfficialExercises(prisma, [bench]);

    expect(result.skipped).toEqual(['bench-press']);
    expect(prisma.exercise.upsert.mock.calls).toHaveLength(0);
    expect(prisma.exerciseName.upsert.mock.calls).toHaveLength(0);
  });
});
