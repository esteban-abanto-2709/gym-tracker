import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { PrismaService } from '@/providers/prisma/prisma.service';

const serviceWithSets = (sets: unknown[]) =>
  new WorkoutsService({
    workout: {
      findFirst: jest.fn().mockResolvedValue(sets[0] ?? null),
    },
  } as unknown as PrismaService);

const day = (iso: string) => new Date(iso);

describe('WorkoutsService.getRecommendation', () => {
  it('returns the last duration for a timed exercise', async () => {
    const service = serviceWithSets([
      {
        weight: null,
        reps: null,
        durationSec: 45,
        createdAt: day('2026-09-02T10:00:00Z'),
      },
      {
        weight: null,
        reps: null,
        durationSec: 40,
        createdAt: day('2026-09-01T10:00:00Z'),
      },
    ]);

    const rec = await service.getRecommendation('u1', 'e1');

    expect(rec.lastDurationSec).toBe(45);
    expect(rec.lastWeight).toBeNull();
  });

  it('returns the reps for a reps-only set', async () => {
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

    const rec = await service.getRecommendation('u1', 'e1');

    expect(rec.lastReps).toBe(15);
    expect(rec.lastWeight).toBeNull();
  });

  it('fetches only the latest matching set, not the whole history', async () => {
    const findMany = jest.fn();
    const findFirst = jest.fn().mockResolvedValue(null);
    const service = new WorkoutsService({
      workout: { findMany, findFirst },
    } as unknown as PrismaService);

    await service.getRecommendation('u1', 'e1', 'barra');

    expect(findMany).not.toHaveBeenCalled();
    expect(findFirst).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'u1',
          exerciseId: 'e1',
          equipmentId: 'barra',
        }) as unknown,
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('with no matching set it returns nulls', async () => {
    const rec = await serviceWithSets([]).getRecommendation('u1', 'e1');

    expect(rec).toMatchObject({
      lastWeight: null,
      lastReps: null,
      lastDurationSec: null,
    });
  });
});

describe('WorkoutsService.findAll', () => {
  it('includes the routine name of each set, only for the user', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new WorkoutsService({
      workout: { findMany },
    } as unknown as PrismaService);

    await service.findAll(
      'u1',
      '2026-10-01T05:00:00.000Z',
      '2026-10-02T05:00:00.000Z',
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'u1' }) as unknown,
        include: expect.objectContaining({
          routine: { select: { name: true } },
        }) as unknown,
      }),
    );
  });

  it('filters by range: from inclusive, to exclusive', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new WorkoutsService({
      workout: { findMany },
    } as unknown as PrismaService);

    await service.findAll(
      'u1',
      '2026-10-01T05:00:00.000Z',
      '2026-10-02T05:00:00.000Z',
    );

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'u1',
          createdAt: {
            gte: new Date('2026-10-01T05:00:00.000Z'),
            lt: new Date('2026-10-02T05:00:00.000Z'),
          },
        },
      }),
    );
  });
});

describe('WorkoutsService lastMeasure', () => {
  const recWithLatest = async (latest: unknown) =>
    new WorkoutsService({
      workout: {
        findFirst: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(latest),
      },
    } as unknown as PrismaService).getRecommendation('u1', 'e1');

  it.each([
    [{ weight: 60, durationSec: null }, 'weight_reps'],
    [{ weight: null, durationSec: null }, 'reps'],
    [{ weight: null, durationSec: 30 }, 'time'],
    [null, null],
  ])(
    'infers the measure from the last set even if the filters do not match (%o)',
    async (latest, expected) => {
      expect((await recWithLatest(latest)).lastMeasure).toBe(expected);
    },
  );
});

describe('WorkoutsService set types', () => {
  type FindFirst = jest.Mock<
    Promise<unknown>,
    [{ where: Record<string, unknown> }]
  >;

  const setup = () => {
    const findFirst: FindFirst = jest
      .fn<Promise<unknown>, [{ where: Record<string, unknown> }]>()
      .mockResolvedValue(null);
    const create = jest
      .fn<Promise<object>, [{ data: Record<string, unknown> }]>()
      .mockResolvedValue({});
    const prisma = {
      workout: { findFirst, create },
      session: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 's1' }),
      },
      $transaction: (fn: (tx: unknown) => unknown) => fn(prisma),
    };
    const service = new WorkoutsService(prisma as unknown as PrismaService);
    return { service, findFirst, create };
  };

  const whereOf = (findFirst: FindFirst) => findFirst.mock.calls[0][0].where;

  it('the recommendation uses only working sets by default', async () => {
    const { service, findFirst } = setup();
    await service.getRecommendation('u1', 'e1');
    expect(whereOf(findFirst).setType).toBe('WORKING');
  });

  it('the warmup recommendation uses only warmups', async () => {
    const { service, findFirst } = setup();
    await service.getRecommendation('u1', 'e1', undefined, 'WARMUP');
    expect(whereOf(findFirst).setType).toBe('WARMUP');
  });

  it('the ramp recommendation filters by step', async () => {
    const { service, findFirst } = setup();
    await service.getRecommendation('u1', 'e1', undefined, 'RAMP', 2);
    expect(whereOf(findFirst)).toMatchObject({ setType: 'RAMP', step: 2 });
  });

  it('the working recommendation does not filter by step', async () => {
    const { service, findFirst } = setup();
    await service.getRecommendation('u1', 'e1');
    expect(whereOf(findFirst)).not.toHaveProperty('step');
  });

  it('the ramp returns the working weight of the exercise', async () => {
    const { service, findFirst } = setup();
    findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ weight: 58.5, durationSec: null })
      .mockResolvedValueOnce({ weight: 58.5 });
    const rec = await service.getRecommendation(
      'u1',
      'e1',
      undefined,
      'RAMP',
      1,
    );
    expect(rec.workingWeight).toBe(58.5);
  });

  it('outside the ramp the working weight is not queried', async () => {
    const { service, findFirst } = setup();
    await service.getRecommendation('u1', 'e1');
    expect(findFirst).toHaveBeenCalledTimes(2);
  });

  it('a set without a type is saved as a working set', async () => {
    const { service, create } = setup();
    await service.create('u1', {
      exerciseId: 'e1',
      reps: 8,
      weight: 60,
    });
    expect(create.mock.calls[0][0].data.setType).toBe('WORKING');
  });

  it('a timed set is saved without reps even if they are sent', async () => {
    const { service, create } = setup();
    await service.create('u1', { exerciseId: 'e1', reps: 1, durationSec: 45 });
    expect(create.mock.calls[0][0].data).toMatchObject({
      reps: null,
      durationSec: 45,
    });
  });

  it('a set is saved in its session, at the time it was done', async () => {
    const { service, create } = setup();
    const performedAt = new Date(Date.now() - 60_000).toISOString();
    await service.create('u1', { exerciseId: 'e1', reps: 8, performedAt });
    expect(create.mock.calls[0][0].data).toMatchObject({
      sessionId: 's1',
      createdAt: new Date(performedAt),
    });
  });
});

describe('CreateWorkoutDto', () => {
  const base = { exerciseId: '0d8f6d1e-2f3a-4b5c-8d9e-0a1b2c3d4e5f', reps: 8 };

  const errorsFor = async (payload: Record<string, unknown>) =>
    validate(plainToInstance(CreateWorkoutDto, payload));

  it('accepts a reps-only set, without weight or duration', async () => {
    expect(await errorsFor(base)).toHaveLength(0);
    expect(await errorsFor({ ...base, weight: null })).toHaveLength(0);
  });

  it('rejects a set with both weight and duration', async () => {
    const errors = await errorsFor({ ...base, weight: 10, durationSec: 30 });
    expect(errors.map((e) => e.property)).toContain('weight');
  });

  it('accepts a set with weight', async () => {
    expect(await errorsFor({ ...base, weight: 60 })).toHaveLength(0);
  });

  it('accepts the set type and rejects an unknown one', async () => {
    expect(
      await errorsFor({ ...base, weight: 20, setType: 'WARMUP' }),
    ).toHaveLength(0);
    const errors = await errorsFor({
      ...base,
      weight: 20,
      setType: 'COOLDOWN',
    });
    expect(errors.map((e) => e.property)).toContain('setType');
  });

  it('accepts a ramp step and rejects a non-positive one', async () => {
    expect(
      await errorsFor({ ...base, weight: 20, setType: 'RAMP', step: 2 }),
    ).toHaveLength(0);
    const errors = await errorsFor({ ...base, weight: 20, step: 0 });
    expect(errors.map((e) => e.property)).toContain('step');
  });

  it('accepts a duration-only set, without reps', async () => {
    const { exerciseId } = base;
    expect(await errorsFor({ exerciseId, durationSec: 45 })).toHaveLength(0);
  });

  it('rejects a set without reps or duration', async () => {
    const errors = await errorsFor({ exerciseId: base.exerciseId });
    expect(errors.map((e) => e.property)).toContain('reps');
  });

  it('accepts the session, the set time and the timezone', async () => {
    expect(
      await errorsFor({
        ...base,
        sessionId: '7c1d2e3f-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
        performedAt: '2026-10-24T03:30:00.000Z',
        timeZone: 'Europe/Madrid',
      }),
    ).toHaveLength(0);
  });

  it('rejects a set time that is not a date', async () => {
    const errors = await errorsFor({ ...base, performedAt: 'yesterday' });
    expect(errors.map((e) => e.property)).toContain('performedAt');
  });
});

describe('UpdateWorkoutDto', () => {
  const errorsFor = async (payload: Record<string, unknown>) =>
    validate(plainToInstance(UpdateWorkoutDto, payload));

  it('allows removing the weight from a set', async () => {
    expect(await errorsFor({ reps: 12, weight: null })).toHaveLength(0);
  });

  it('rejects weight and duration together', async () => {
    const errors = await errorsFor({ weight: 10, durationSec: 30 });
    expect(errors.map((e) => e.property)).toContain('weight');
  });
});
