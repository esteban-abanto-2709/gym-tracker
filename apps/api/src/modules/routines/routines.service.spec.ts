import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { PrismaService } from '@/providers/prisma/prisma.service';

const EXERCISE_ID = '6f1c1a4e-2b5d-4c8e-9a7b-3d2e1f0a9b8c';

const createdItems = async (items: unknown[]) => {
  const create = jest.fn().mockResolvedValue({});
  const service = new RoutinesService({
    routine: { create },
  } as unknown as PrismaService);
  await service.create('u1', {
    name: 'Upper A',
    items,
  } as CreateRoutineDto);
  return (
    create.mock.calls[0][0] as {
      data: { items: { create: { blocks: unknown }[] } };
    }
  ).data.items.create;
};

const dtoErrors = async (items: unknown[]) =>
  validate(plainToInstance(CreateRoutineDto, { name: 'Upper A', items }));

describe('RoutinesService blocks', () => {
  it('arma un bloque legacy desde las metas viejas', async () => {
    const [item] = await createdItems([
      {
        exerciseId: EXERCISE_ID,
        position: 0,
        targetSets: 1,
        targetReps: 10,
        isApproximation: true,
      },
    ]);

    expect(item.blocks).toEqual([
      { kind: 'legacy', sets: 1, reps: 10, durationSec: null, approx: true },
    ]);
  });

  it('un slot sin metas queda como un bloque legacy vacio', async () => {
    const [item] = await createdItems([
      { exerciseId: EXERCISE_ID, position: 0 },
    ]);

    expect(item.blocks).toEqual([
      {
        kind: 'legacy',
        sets: null,
        reps: null,
        durationSec: null,
        approx: false,
      },
    ]);
  });

  it('respeta los bloques enviados, en orden', async () => {
    const [item] = await createdItems([
      {
        exerciseId: EXERCISE_ID,
        position: 0,
        blocks: [
          { kind: 'legacy', sets: 3, reps: 8 },
          { kind: 'legacy', sets: 2, reps: 12, approx: true },
        ],
      },
    ]);

    expect(item.blocks).toEqual([
      { kind: 'legacy', sets: 3, reps: 8, durationSec: null, approx: false },
      { kind: 'legacy', sets: 2, reps: 12, durationSec: null, approx: true },
    ]);
  });
});

describe('CreateRoutineDto blocks', () => {
  it('acepta bloques legacy', async () => {
    const errors = await dtoErrors([
      {
        exerciseId: EXERCISE_ID,
        position: 0,
        blocks: [{ kind: 'legacy', sets: 3, reps: 8, approx: false }],
      },
    ]);

    expect(errors).toHaveLength(0);
  });

  it('rechaza un tipo de bloque desconocido', async () => {
    const errors = await dtoErrors([
      {
        exerciseId: EXERCISE_ID,
        position: 0,
        blocks: [{ kind: 'ramp' }],
      },
    ]);

    expect(errors).not.toHaveLength(0);
  });

  it('rechaza metas invalidas dentro del bloque', async () => {
    const errors = await dtoErrors([
      {
        exerciseId: EXERCISE_ID,
        position: 0,
        blocks: [{ kind: 'legacy', sets: 0 }],
      },
    ]);

    expect(errors).not.toHaveLength(0);
  });
});
