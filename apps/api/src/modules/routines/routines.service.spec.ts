import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { PrismaService } from '@/providers/prisma/prisma.service';

const EXERCISE_ID = '6f1c1a4e-2b5d-4c8e-9a7b-3d2e1f0a9b8c';

type RoutineCreateArgs = {
  data: { items: { create: { blocks: unknown }[] } };
};

const storedBlocks = async (blocks: unknown[]) => {
  const create = jest
    .fn<Promise<object>, [RoutineCreateArgs]>()
    .mockResolvedValue({});
  const service = new RoutinesService({
    routine: { create },
  } as unknown as PrismaService);
  await service.create('u1', {
    name: 'Upper A',
    items: [{ exerciseId: EXERCISE_ID, position: 0, blocks }],
  } as CreateRoutineDto);
  return create.mock.calls[0][0].data.items.create[0].blocks;
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
  it('fills each kind with its fields and null for the missing ones', async () => {
    expect(
      await storedBlocks([
        { kind: 'weight_reps' },
        { kind: 'weight_reps', sets: 3, reps: 8 },
        { kind: 'weight_reps', sets: 3, reps: 8, repsMax: 10 },
        { kind: 'reps', sets: 2, reps: 15 },
        { kind: 'time', sets: 3, durationSec: 30 },
        { kind: 'warmup', sets: 2 },
        { kind: 'ramp', steps: [{ reps: 10, pct: 50 }, { reps: 5 }] },
      ]),
    ).toEqual([
      { kind: 'weight_reps', sets: null, reps: null, repsMax: null },
      { kind: 'weight_reps', sets: 3, reps: 8, repsMax: null },
      { kind: 'weight_reps', sets: 3, reps: 8, repsMax: 10 },
      { kind: 'reps', sets: 2, reps: 15, repsMax: null },
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

  it('a slot without blocks stays free', async () => {
    expect(await storedBlocks([])).toEqual([]);
  });

  it('keeps the order of the blocks', async () => {
    expect(
      await storedBlocks([
        { kind: 'warmup', sets: 2, reps: 12 },
        { kind: 'weight_reps', sets: 3, reps: 8 },
      ]),
    ).toEqual([
      { kind: 'warmup', sets: 2, reps: 12 },
      { kind: 'weight_reps', sets: 3, reps: 8, repsMax: null },
    ]);
  });
});

describe('CreateRoutineDto blocks', () => {
  it('accepts every block kind', async () => {
    const errors = await dtoErrors(
      [
        { kind: 'weight_reps', sets: 3, reps: 8, repsMax: 10 },
        { kind: 'reps', sets: 2, reps: 6, repsMax: 8 },
        { kind: 'weight_reps', sets: 3, reps: 10, repsMax: 10 },
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

  it('rejects a slot without the block list', async () => {
    expect(await dtoErrors(undefined)).not.toHaveLength(0);
  });

  it.each(['superset', 'legacy'])('rejects the block kind %s', async (kind) => {
    expect(await dtoErrors([{ kind }])).not.toHaveLength(0);
  });

  it.each([
    ['without steps', { steps: [] }],
    ['without the step list', {}],
    ['with an invalid step', { steps: [{ reps: 0 }] }],
    ['with a foreign field in a step', { steps: [{ reps: 10, sets: 1 }] }],
  ])('rejects a ramp %s', async (_label, extra) => {
    expect(
      await dtoErrors([{ kind: 'ramp', ...extra }], true),
    ).not.toHaveLength(0);
  });

  it.each([
    ['below the minimum', { reps: 10, repsMax: 8 }],
    ['without a minimum', { repsMax: 10 }],
  ])('rejects a max reps %s', async (_label, extra) => {
    for (const kind of ['weight_reps', 'reps']) {
      expect(await dtoErrors([{ kind, sets: 3, ...extra }])).not.toHaveLength(
        0,
      );
    }
  });

  it('rejects invalid targets inside the block', async () => {
    expect(await dtoErrors([{ kind: 'time', sets: 0 }])).not.toHaveLength(0);
  });

  it.each([
    ['reps', { durationSec: 30 }],
    ['time', { reps: 10 }],
    ['weight_reps', { approx: true }],
    ['warmup', { reps: 10, repsMax: 12 }],
    ['time', { repsMax: 12 }],
    ['weight_reps', { durationSec: 30 }],
    ['ramp', { steps: [{ reps: 10, pct: 50 }] }],
  ])(
    'rejects a field that does not belong to a %s block',
    async (kind, extra) => {
      const errors = await dtoErrors([{ kind, sets: 2, ...extra }], true);
      expect(errors).not.toHaveLength(0);
    },
  );
});
