import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { PrismaService } from '@/providers/prisma/prisma.service';

const serviceWithSets = (sets: unknown[]) =>
  new WorkoutsService({
    workout: { findMany: jest.fn().mockResolvedValue(sets) },
  } as unknown as PrismaService);

const day = (iso: string) => new Date(iso);

describe('WorkoutsService.getRecommendation', () => {
  it('no sugiere peso en un ejercicio de tiempo y devuelve la ultima duracion', async () => {
    const service = serviceWithSets([
      {
        weight: null,
        reps: 1,
        durationSec: 45,
        createdAt: day('2026-09-02T10:00:00Z'),
      },
      {
        weight: null,
        reps: 1,
        durationSec: 40,
        createdAt: day('2026-09-01T10:00:00Z'),
      },
    ]);

    const rec = await service.getRecommendation('u1', 'e1', false);

    expect(rec.suggestedWeight).toBeNull();
    expect(rec.lastDurationSec).toBe(45);
    expect(rec.lastWeight).toBeNull();
  });

  it('sigue sugiriendo peso cuando se baten las reps por el margen', async () => {
    const service = serviceWithSets([
      {
        weight: 60,
        reps: 12,
        durationSec: null,
        createdAt: day('2026-09-02T10:00:00Z'),
      },
      {
        weight: 60,
        reps: 8,
        durationSec: null,
        createdAt: day('2026-09-01T10:00:00Z'),
      },
    ]);

    const rec = await service.getRecommendation('u1', 'e1', false);

    expect(rec.suggestedWeight).toBe(62.5);
    expect(rec.lastDurationSec).toBeNull();
  });
});

describe('CreateWorkoutDto', () => {
  const base = { exerciseId: '0d8f6d1e-2f3a-4b5c-8d9e-0a1b2c3d4e5f', reps: 8 };

  const errorsFor = async (payload: Record<string, unknown>) =>
    validate(plainToInstance(CreateWorkoutDto, payload));

  it('rechaza un set sin peso y sin duracion', async () => {
    const errors = await errorsFor(base);
    expect(errors.map((e) => e.property)).toContain('weight');
  });

  it('acepta un set con peso', async () => {
    expect(await errorsFor({ ...base, weight: 60 })).toHaveLength(0);
  });

  it('acepta un set solo con duracion', async () => {
    expect(await errorsFor({ ...base, reps: 1, durationSec: 45 })).toHaveLength(
      0,
    );
  });
});
