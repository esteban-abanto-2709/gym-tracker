import { NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ProgramsService, nextInRotation } from './programs.service';
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
