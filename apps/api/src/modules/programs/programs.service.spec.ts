import { NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  ProgramsService,
  nextInRotation,
  uniqueName,
} from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { PrismaService } from '@/providers/prisma/prisma.service';

const UPPER_A = '6f1c1a4e-2b5d-4c8e-9a7b-3d2e1f0a9b8c';
const LOWER_A = '0b8e2c71-5d3a-4f6e-8c1b-7a9d2e4f6b30';

const setup = (ownedRoutines: number) => {
  const tx = {
    program: {
      create: jest.fn().mockResolvedValue({ id: 'p1' }),
      update: jest.fn().mockResolvedValue({ id: 'p1' }),
      findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'p1' }),
    },
    routine: {
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
    },
  };
  const prisma = {
    ...tx,
    program: { ...tx.program, findFirst: jest.fn().mockResolvedValue({}) },
    routine: {
      ...tx.routine,
      count: jest.fn().mockResolvedValue(ownedRoutines),
    },
    $transaction: (run: (client: typeof tx) => unknown) => run(tx),
  };
  const service = new ProgramsService(prisma as unknown as PrismaService);
  const assigned = () =>
    tx.routine.update.mock.calls.map(
      ([arg]: [{ where: { id: string }; data: unknown }]) => [
        arg.where.id,
        arg.data,
      ],
    );
  return { service, tx, assigned };
};

describe('ProgramsService routines', () => {
  it('assigns the routines in the order received', async () => {
    const { service, assigned } = setup(2);

    await service.create('u1', {
      name: 'Upper/Lower',
      routineIds: [UPPER_A, LOWER_A],
    });

    expect(assigned()).toEqual([
      [UPPER_A, { programId: 'p1', programPosition: 0 }],
      [LOWER_A, { programId: 'p1', programPosition: 1 }],
    ]);
  });

  it('on edit releases the previous routines before reassigning', async () => {
    const { service, tx, assigned } = setup(1);

    await service.update('p1', 'u1', { routineIds: [LOWER_A] });

    expect(tx.routine.updateMany).toHaveBeenCalledWith({
      where: { programId: 'p1' },
      data: { programId: null, programPosition: null },
    });
    expect(tx.routine.updateMany.mock.invocationCallOrder[0]).toBeLessThan(
      tx.routine.update.mock.invocationCallOrder[0],
    );
    expect(assigned()).toEqual([
      [LOWER_A, { programId: 'p1', programPosition: 0 }],
    ]);
  });

  it('rejects routines the user does not own', async () => {
    const { service, tx } = setup(1);

    await expect(
      service.create('u1', { name: 'PPL', routineIds: [UPPER_A, LOWER_A] }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.program.create).not.toHaveBeenCalled();
  });
});

describe('nextInRotation', () => {
  const rotation = ['upper-a', 'lower-a', 'upper-b', 'lower-b'];

  it.each([
    ['with no history picks the first', null, 'upper-a'],
    ['mid-rotation picks the next', 'lower-a', 'upper-b'],
    ['after the last wraps to the start', 'lower-b', 'upper-a'],
    ['a routine no longer in the program restarts', 'push', 'upper-a'],
  ])('%s', (_label, last, expected) => {
    expect(nextInRotation(rotation, last)).toBe(expected);
  });

  it('a program without routines suggests nothing', () => {
    expect(nextInRotation([], 'upper-a')).toBeNull();
  });
});

describe('uniqueName', () => {
  it.each([
    ['a free name stays the same', [], 'Upper A'],
    ['a taken name gets (2)', ['Upper A'], 'Upper A (2)'],
    ['skips taken suffixes', ['Upper A', 'Upper A (2)'], 'Upper A (3)'],
  ])('%s', (_label, taken, expected) => {
    expect(uniqueName('Upper A', new Set(taken))).toBe(expected);
  });
});

describe('CreateProgramDto', () => {
  it('rejects a repeated routine', async () => {
    const errors = await validate(
      plainToInstance(CreateProgramDto, {
        name: 'PPL',
        routineIds: [UPPER_A, UPPER_A],
      }),
    );
    expect(errors).not.toHaveLength(0);
  });
});
