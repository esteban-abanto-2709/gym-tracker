import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { PrismaService } from '@/providers/prisma/prisma.service';

const EXERCISE_ID = '6f1c1a4e-2b5d-4c8e-9a7b-3d2e1f0a9b8c';

const storedBlocks = async (blocks: unknown[]) => {
  const create = jest.fn().mockResolvedValue({});
  const service = new RoutinesService({
    routine: { create },
  } as unknown as PrismaService);
  await service.create('u1', {
    name: 'Upper A',
    items: [{ exerciseId: EXERCISE_ID, position: 0, blocks }],
  } as CreateRoutineDto);
  return (
    create.mock.calls[0][0] as {
      data: { items: { create: { blocks: unknown }[] } };
    }
  ).data.items.create[0].blocks;
};

const dtoErrors = async (blocks: unknown, strict = false) =>
  validate(
    plainToInstance(CreateRoutineDto, {
      name: 'Upper A',
      items: [{ exerciseId: EXERCISE_ID, position: 0, blocks }],
    }),
    strict ? { whitelist: true, forbidNonWhitelisted: true } : {},
  );

describe('RoutinesService blocks', () => {
  it('completa cada tipo con sus campos y null en lo que falta', async () => {
    expect(
      await storedBlocks([
        { kind: 'weight_reps' },
        { kind: 'weight_reps', sets: 3, reps: 8 },
        { kind: 'reps', sets: 2, reps: 15 },
        { kind: 'time', sets: 3, durationSec: 30 },
        { kind: 'warmup', sets: 2 },
        { kind: 'ramp', steps: [{ reps: 10, pct: 50 }, { reps: 5 }] },
      ]),
    ).toEqual([
      { kind: 'weight_reps', sets: null, reps: null, approx: false },
      { kind: 'weight_reps', sets: 3, reps: 8, approx: false },
      { kind: 'reps', sets: 2, reps: 15 },
      { kind: 'time', sets: 3, durationSec: 30 },
      { kind: 'warmup', sets: 2, reps: null },
      {
        kind: 'ramp',
        steps: [
          { reps: 10, pct: 50 },
          { reps: 5, pct: null },
        ],
      },
    ]);
  });

  it('un slot sin bloques queda libre', async () => {
    expect(await storedBlocks([])).toEqual([]);
  });

  it('respeta el orden y la marca de aproximacion', async () => {
    expect(
      await storedBlocks([
        { kind: 'weight_reps', sets: 3, reps: 8 },
        { kind: 'weight_reps', sets: 2, reps: 12, approx: true },
      ]),
    ).toEqual([
      { kind: 'weight_reps', sets: 3, reps: 8, approx: false },
      { kind: 'weight_reps', sets: 2, reps: 12, approx: true },
    ]);
  });
});

describe('CreateRoutineDto blocks', () => {
  it('acepta todos los tipos de bloque', async () => {
    const errors = await dtoErrors(
      [
        { kind: 'weight_reps', sets: 3, reps: 8, approx: true },
        { kind: 'reps', sets: 2, reps: 15 },
        { kind: 'time', sets: 3, durationSec: 30 },
        { kind: 'warmup', sets: 2, reps: 25 },
        {
          kind: 'ramp',
          steps: [
            { reps: 10, pct: 50 },
            { reps: 5, pct: 70 },
            { reps: 3, pct: 85 },
          ],
        },
      ],
      true,
    );

    expect(errors).toHaveLength(0);
  });

  it('rechaza un slot sin la lista de bloques', async () => {
    expect(await dtoErrors(undefined)).not.toHaveLength(0);
  });

  it.each(['superset', 'legacy'])(
    'rechaza el tipo de bloque %s',
    async (kind) => {
      expect(await dtoErrors([{ kind }])).not.toHaveLength(0);
    },
  );

  it.each([
    ['sin escalones', { steps: [] }],
    ['sin la lista de escalones', {}],
    ['con un escalon invalido', { steps: [{ reps: 0 }] }],
    ['con un campo ajeno en el escalon', { steps: [{ reps: 10, sets: 1 }] }],
  ])('rechaza una rampa %s', async (_label, extra) => {
    expect(await dtoErrors([{ kind: 'ramp', ...extra }], true)).not.toHaveLength(
      0,
    );
  });

  it('rechaza metas invalidas dentro del bloque', async () => {
    expect(await dtoErrors([{ kind: 'time', sets: 0 }])).not.toHaveLength(0);
  });

  it.each([
    ['reps', { durationSec: 30 }],
    ['time', { reps: 10 }],
    ['warmup', { approx: true }],
    ['weight_reps', { durationSec: 30 }],
    ['ramp', { steps: [{ reps: 10, pct: 50 }] }],
  ])(
    'rechaza en un bloque %s un campo que no le corresponde',
    async (kind, extra) => {
      const errors = await dtoErrors([{ kind, sets: 2, ...extra }], true);
      expect(errors).not.toHaveLength(0);
    },
  );
});
