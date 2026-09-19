import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { PrismaService } from '@/providers/prisma/prisma.service';

const serviceWithSets = (sets: unknown[]) =>
  new WorkoutsService({
    workout: {
      findMany: jest.fn().mockResolvedValue(sets),
      findFirst: jest.fn().mockResolvedValue(sets[0] ?? null),
    },
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

  it('en un set solo de reps devuelve las reps sin sugerir peso', async () => {
    const service = serviceWithSets([
      {
        weight: null,
        reps: 15,
        durationSec: null,
        createdAt: day('2026-09-02T10:00:00Z'),
      },
      {
        weight: null,
        reps: 10,
        durationSec: null,
        createdAt: day('2026-09-01T10:00:00Z'),
      },
    ]);

    const rec = await service.getRecommendation('u1', 'e1', false);

    expect(rec.lastReps).toBe(15);
    expect(rec.lastWeight).toBeNull();
    expect(rec.suggestedWeight).toBeNull();
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

describe('WorkoutsService lastMeasure', () => {
  const recWithLatest = async (latest: unknown) =>
    new WorkoutsService({
      workout: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(latest),
      },
    } as unknown as PrismaService).getRecommendation('u1', 'e1', false);

  it.each([
    [{ weight: 60, durationSec: null }, 'weight_reps'],
    [{ weight: null, durationSec: null }, 'reps'],
    [{ weight: null, durationSec: 30 }, 'time'],
    [null, null],
  ])(
    'deduce la medicion del ultimo set aunque no coincidan los filtros (%o)',
    async (latest, expected) => {
      expect((await recWithLatest(latest)).lastMeasure).toBe(expected);
    },
  );
});

describe('WorkoutsService set types', () => {
  const setup = () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const findFirst = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue({});
    const service = new WorkoutsService({
      workout: { findMany, findFirst, create },
    } as unknown as PrismaService);
    return { service, findMany, create };
  };

  const whereOf = (findMany: jest.Mock) =>
    (findMany.mock.calls[0][0] as { where: Record<string, unknown> }).where;

  it('la recomendacion usa solo series efectivas por defecto', async () => {
    const { service, findMany } = setup();
    await service.getRecommendation('u1', 'e1', false);
    expect(whereOf(findMany).setType).toBe('WORKING');
  });

  it('la recomendacion de calentamiento usa solo calentamientos', async () => {
    const { service, findMany } = setup();
    await service.getRecommendation(
      'u1',
      'e1',
      false,
      undefined,
      undefined,
      'WARMUP',
    );
    expect(whereOf(findMany).setType).toBe('WARMUP');
  });

  it('un set sin tipo se guarda como efectivo', async () => {
    const { service, create } = setup();
    await service.create('u1', {
      exerciseId: 'e1',
      reps: 8,
      weight: 60,
    } as CreateWorkoutDto);
    const data = (create.mock.calls[0][0] as { data: { setType: string } })
      .data;
    expect(data.setType).toBe('WORKING');
  });
});

describe('CreateWorkoutDto', () => {
  const base = { exerciseId: '0d8f6d1e-2f3a-4b5c-8d9e-0a1b2c3d4e5f', reps: 8 };

  const errorsFor = async (payload: Record<string, unknown>) =>
    validate(plainToInstance(CreateWorkoutDto, payload));

  it('acepta un set solo de reps, sin peso ni duracion', async () => {
    expect(await errorsFor(base)).toHaveLength(0);
    expect(await errorsFor({ ...base, weight: null })).toHaveLength(0);
  });

  it('rechaza un set con peso y duracion a la vez', async () => {
    const errors = await errorsFor({ ...base, weight: 10, durationSec: 30 });
    expect(errors.map((e) => e.property)).toContain('weight');
  });

  it('acepta un set con peso', async () => {
    expect(await errorsFor({ ...base, weight: 60 })).toHaveLength(0);
  });

  it('acepta el tipo de set y rechaza uno desconocido', async () => {
    expect(
      await errorsFor({ ...base, weight: 20, setType: 'WARMUP' }),
    ).toHaveLength(0);
    const errors = await errorsFor({ ...base, weight: 20, setType: 'COOLDOWN' });
    expect(errors.map((e) => e.property)).toContain('setType');
  });

  it('acepta un escalon de rampa y rechaza uno no positivo', async () => {
    expect(
      await errorsFor({ ...base, weight: 20, setType: 'RAMP', step: 2 }),
    ).toHaveLength(0);
    const errors = await errorsFor({ ...base, weight: 20, step: 0 });
    expect(errors.map((e) => e.property)).toContain('step');
  });

  it('acepta un set solo con duracion', async () => {
    expect(await errorsFor({ ...base, reps: 1, durationSec: 45 })).toHaveLength(
      0,
    );
  });
});

describe('UpdateWorkoutDto', () => {
  const errorsFor = async (payload: Record<string, unknown>) =>
    validate(plainToInstance(UpdateWorkoutDto, payload));

  it('permite quitar el peso de un set', async () => {
    expect(await errorsFor({ reps: 12, weight: null })).toHaveLength(0);
  });

  it('rechaza peso y duracion a la vez', async () => {
    const errors = await errorsFor({ weight: 10, durationSec: 30 });
    expect(errors.map((e) => e.property)).toContain('weight');
  });
});
