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
  it('en un ejercicio de tiempo devuelve la ultima duracion', async () => {
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

  it('en un set solo de reps devuelve las reps', async () => {
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
});

describe('WorkoutsService.findAll', () => {
  it('trae el nombre de la rutina de cada serie, solo las del usuario', async () => {
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

  it('filtra por rango: desde inclusive, hasta exclusivo', async () => {
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

describe('WorkoutsService.getDays', () => {
  it('devuelve los dias locales y las series desde el inicio del ultimo dia', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([
        { createdAt: day('2026-10-09T02:00:00Z') },
        { createdAt: day('2026-10-08T14:00:00Z') },
        { createdAt: day('2026-10-08T13:00:00Z') },
        { createdAt: day('2026-10-06T15:00:00Z') },
      ])
      .mockResolvedValueOnce([{ id: 's1' }]);
    const service = new WorkoutsService({
      workout: { findMany },
    } as unknown as PrismaService);

    const result = await service.getDays('u1', 'America/Lima');

    expect(result).toEqual({
      days: ['2026-10-08', '2026-10-06'],
      sets: [{ id: 's1' }],
    });
    expect(findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: {
          userId: 'u1',
          createdAt: { gte: day('2026-10-08T13:00:00Z') },
        },
      }),
    );
  });

  it('sin series no pide nada mas', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new WorkoutsService({
      workout: { findMany },
    } as unknown as PrismaService);

    expect(await service.getDays('u1')).toEqual({ days: [], sets: [] });
    expect(findMany).toHaveBeenCalledTimes(1);
  });
});

describe('WorkoutsService lastMeasure', () => {
  const recWithLatest = async (latest: unknown) =>
    new WorkoutsService({
      workout: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(latest),
      },
    } as unknown as PrismaService).getRecommendation('u1', 'e1');

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
  type FindMany = jest.Mock<
    Promise<unknown[]>,
    [{ where: Record<string, unknown> }]
  >;

  const setup = () => {
    const findMany: FindMany = jest
      .fn<Promise<unknown[]>, [{ where: Record<string, unknown> }]>()
      .mockResolvedValue([]);
    const findFirst = jest.fn().mockResolvedValue(null);
    const create = jest
      .fn<Promise<object>, [{ data: Record<string, unknown> }]>()
      .mockResolvedValue({});
    const service = new WorkoutsService({
      workout: { findMany, findFirst, create },
    } as unknown as PrismaService);
    return { service, findMany, findFirst, create };
  };

  const whereOf = (findMany: FindMany) => findMany.mock.calls[0][0].where;

  it('la recomendacion usa solo series efectivas por defecto', async () => {
    const { service, findMany } = setup();
    await service.getRecommendation('u1', 'e1');
    expect(whereOf(findMany).setType).toBe('WORKING');
  });

  it('la recomendacion de calentamiento usa solo calentamientos', async () => {
    const { service, findMany } = setup();
    await service.getRecommendation('u1', 'e1', undefined, 'WARMUP');
    expect(whereOf(findMany).setType).toBe('WARMUP');
  });

  it('la recomendacion de rampa filtra por escalon', async () => {
    const { service, findMany } = setup();
    await service.getRecommendation('u1', 'e1', undefined, 'RAMP', 2);
    expect(whereOf(findMany)).toMatchObject({ setType: 'RAMP', step: 2 });
  });

  it('la recomendacion efectiva no filtra por escalon', async () => {
    const { service, findMany } = setup();
    await service.getRecommendation('u1', 'e1');
    expect(whereOf(findMany)).not.toHaveProperty('step');
  });

  it('la rampa devuelve el peso efectivo del ejercicio', async () => {
    const { service, findFirst } = setup();
    findFirst
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

  it('fuera de la rampa no se consulta el peso efectivo', async () => {
    const { service, findFirst } = setup();
    await service.getRecommendation('u1', 'e1');
    expect(findFirst).toHaveBeenCalledTimes(1);
  });

  it('un set sin tipo se guarda como efectivo', async () => {
    const { service, create } = setup();
    await service.create('u1', {
      exerciseId: 'e1',
      reps: 8,
      weight: 60,
    });
    expect(create.mock.calls[0][0].data.setType).toBe('WORKING');
  });

  it('un set de tiempo se guarda sin reps aunque lleguen', async () => {
    const { service, create } = setup();
    await service.create('u1', { exerciseId: 'e1', reps: 1, durationSec: 45 });
    expect(create.mock.calls[0][0].data).toMatchObject({
      reps: null,
      durationSec: 45,
    });
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
    const errors = await errorsFor({
      ...base,
      weight: 20,
      setType: 'COOLDOWN',
    });
    expect(errors.map((e) => e.property)).toContain('setType');
  });

  it('acepta un escalon de rampa y rechaza uno no positivo', async () => {
    expect(
      await errorsFor({ ...base, weight: 20, setType: 'RAMP', step: 2 }),
    ).toHaveLength(0);
    const errors = await errorsFor({ ...base, weight: 20, step: 0 });
    expect(errors.map((e) => e.property)).toContain('step');
  });

  it('acepta un set solo con duracion, sin reps', async () => {
    const { exerciseId } = base;
    expect(await errorsFor({ exerciseId, durationSec: 45 })).toHaveLength(0);
  });

  it('rechaza un set sin reps ni duracion', async () => {
    const errors = await errorsFor({ exerciseId: base.exerciseId });
    expect(errors.map((e) => e.property)).toContain('reps');
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
