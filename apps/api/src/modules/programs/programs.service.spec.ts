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
    routine: { ...tx.routine, count: jest.fn().mockResolvedValue(ownedRoutines) },
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

describe('ProgramsService rutinas', () => {
  it('asigna las rutinas en el orden recibido', async () => {
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

  it('al editar suelta las rutinas anteriores antes de reasignar', async () => {
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

  it('rechaza rutinas que no son del usuario', async () => {
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
    ['sin historial toca la primera', null, 'upper-a'],
    ['en medio de la rotacion toca la siguiente', 'lower-a', 'upper-b'],
    ['tras la ultima vuelve al inicio', 'lower-b', 'upper-a'],
    ['una rutina que ya no esta en el programa reinicia', 'push', 'upper-a'],
  ])('%s', (_label, last, expected) => {
    expect(nextInRotation(rotation, last)).toBe(expected);
  });

  it('un programa sin rutinas no sugiere nada', () => {
    expect(nextInRotation([], 'upper-a')).toBeNull();
  });
});

describe('uniqueName', () => {
  it.each([
    ['libre queda igual', [], 'Upper A'],
    ['repetido suma (2)', ['Upper A'], 'Upper A (2)'],
    ['salta los sufijos ocupados', ['Upper A', 'Upper A (2)'], 'Upper A (3)'],
  ])('%s', (_label, taken, expected) => {
    expect(uniqueName('Upper A', new Set(taken))).toBe(expected);
  });
});

describe('ProgramsService copia', () => {
  const source = {
    id: 'src',
    name: 'Upper/Lower',
    routines: [
      {
        name: 'Upper A',
        items: [{ exerciseId: 'ex1', position: 0, blocks: [{ kind: 'reps' }] }],
      },
      { name: 'Lower A', items: [] },
    ],
  };

  const setupCopy = (activeProgramId: string | null) => {
    const tx = {
      program: {
        create: jest.fn().mockResolvedValue({ id: 'copy' }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'copy' }),
      },
      routine: { create: jest.fn().mockResolvedValue({}) },
      user: { update: jest.fn().mockResolvedValue({}) },
    };
    const prisma = {
      program: {
        findUnique: jest.fn().mockResolvedValue(source),
        findMany: jest.fn().mockResolvedValue([{ name: 'Upper/Lower' }]),
      },
      routine: {
        findMany: jest.fn().mockResolvedValue([{ name: 'Upper A' }]),
      },
      user: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ activeProgramId }),
      },
      $transaction: (run: (client: typeof tx) => unknown) => run(tx),
    };
    const service = new ProgramsService(prisma as unknown as PrismaService);
    return { service, tx };
  };

  it('crea filas propias, con sufijo si el nombre choca', async () => {
    const { service, tx } = setupCopy('mine');

    await service.copy('src', 'friend');

    expect(tx.program.create).toHaveBeenCalledWith({
      data: { userId: 'friend', name: 'Upper/Lower (2)', copiedFromId: 'src' },
    });
    expect(
      tx.routine.create.mock.calls.map(
        ([arg]: [{ data: Record<string, unknown> }]) => arg.data,
      ),
    ).toEqual([
      {
        userId: 'friend',
        name: 'Upper A (2)',
        programId: 'copy',
        programPosition: 0,
        items: {
          create: [
            { exerciseId: 'ex1', position: 0, blocks: [{ kind: 'reps' }] },
          ],
        },
      },
      {
        userId: 'friend',
        name: 'Lower A',
        programId: 'copy',
        programPosition: 1,
        items: { create: [] },
      },
    ]);
  });

  it('activa la copia si no habia programa activo', async () => {
    const { service, tx } = setupCopy(null);

    const result = await service.copy('src', 'friend');

    expect(result.activated).toBe(true);
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'friend' },
      data: { activeProgramId: 'copy' },
    });
  });

  it('no toca el programa activo que ya tenias', async () => {
    const { service, tx } = setupCopy('mine');

    const result = await service.copy('src', 'friend');

    expect(result.activated).toBe(false);
    expect(tx.user.update).not.toHaveBeenCalled();
  });
});

describe('CreateProgramDto', () => {
  it('rechaza una rutina repetida', async () => {
    const errors = await validate(
      plainToInstance(CreateProgramDto, {
        name: 'PPL',
        routineIds: [UPPER_A, UPPER_A],
      }),
    );
    expect(errors).not.toHaveLength(0);
  });
});
