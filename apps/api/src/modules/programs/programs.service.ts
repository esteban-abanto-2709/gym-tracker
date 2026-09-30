import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { itemsInclude } from '../routines/routines.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

const routinesInclude = {
  routines: {
    include: itemsInclude,
    orderBy: { programPosition: 'asc' as const },
  },
};

export function nextInRotation(
  routineIds: string[],
  lastRoutineId: string | null,
) {
  if (routineIds.length === 0) return null;
  const last = lastRoutineId ? routineIds.indexOf(lastRoutineId) : -1;
  return routineIds[(last + 1) % routineIds.length];
}

export function uniqueName(base: string, taken: Set<string>) {
  let name = base;
  for (let n = 2; taken.has(name); n++) {
    name = `${base} (${n})`;
  }
  return name;
}

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProgramDto) {
    await this.assertOwnRoutines(userId, dto.routineIds);

    return this.withUniqueName(() =>
      this.prisma.$transaction(async (tx) => {
        const program = await tx.program.create({
          data: { userId, name: dto.name },
        });
        await this.assignRoutines(tx, program.id, dto.routineIds);
        return tx.program.findUniqueOrThrow({
          where: { id: program.id },
          include: routinesInclude,
        });
      }),
    );
  }

  async findAll(userId: string) {
    return this.prisma.program.findMany({
      where: { userId },
      include: routinesInclude,
      orderBy: { name: 'asc' },
    });
  }

  async explore(userId: string) {
    return this.prisma.program.findMany({
      where: { userId: { not: userId }, routines: { some: {} } },
      include: { ...routinesInclude, user: { select: { username: true } } },
      orderBy: [{ user: { username: 'asc' } }, { name: 'asc' }],
    });
  }

  async copy(id: string, userId: string) {
    const source = await this.prisma.program.findUnique({
      where: { id },
      include: routinesInclude,
    });

    if (!source) {
      throw new NotFoundException(`Program ${id} not found`);
    }

    const [programs, routines, user] = await Promise.all([
      this.prisma.program.findMany({ where: { userId }, select: { name: true } }),
      this.prisma.routine.findMany({ where: { userId }, select: { name: true } }),
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { activeProgramId: true },
      }),
    ]);
    const routineNames = new Set(routines.map((r) => r.name));
    const activated = user.activeProgramId === null;

    const program = await this.prisma.$transaction(async (tx) => {
      const copy = await tx.program.create({
        data: {
          userId,
          name: uniqueName(source.name, new Set(programs.map((p) => p.name))),
          copiedFromId: source.id,
        },
      });

      for (const [programPosition, routine] of source.routines.entries()) {
        const name = uniqueName(routine.name, routineNames);
        routineNames.add(name);
        await tx.routine.create({
          data: {
            userId,
            name,
            programId: copy.id,
            programPosition,
            items: {
              create: routine.items.map((item) => ({
                exerciseId: item.exerciseId,
                position: item.position,
                blocks: item.blocks as Prisma.InputJsonValue,
              })),
            },
          },
        });
      }

      if (activated) {
        await tx.user.update({
          where: { id: userId },
          data: { activeProgramId: copy.id },
        });
      }

      return tx.program.findUniqueOrThrow({
        where: { id: copy.id },
        include: routinesInclude,
      });
    });

    return { program, activated };
  }

  async findOne(id: string, userId: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, userId },
      include: routinesInclude,
    });

    if (!program) {
      throw new NotFoundException(`Program ${id} not found`);
    }

    return program;
  }

  async update(id: string, userId: string, dto: UpdateProgramDto) {
    await this.findOne(id, userId);
    if (dto.routineIds) {
      await this.assertOwnRoutines(userId, dto.routineIds);
    }

    return this.withUniqueName(() =>
      this.prisma.$transaction(async (tx) => {
        if (dto.routineIds) {
          await this.releaseRoutines(tx, id);
          await this.assignRoutines(tx, id, dto.routineIds);
        }

        return tx.program.update({
          where: { id },
          data: dto.name ? { name: dto.name } : {},
          include: routinesInclude,
        });
      }),
    );
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.$transaction(async (tx) => {
      await this.releaseRoutines(tx, id);
      return tx.program.delete({ where: { id } });
    });
  }

  async findActive(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { activeProgram: { include: routinesInclude } },
    });
    const program = user.activeProgram;
    if (!program) return { program: null, nextRoutineId: null };

    const routineIds = program.routines.map((r) => r.id);
    const last = await this.prisma.workout.findFirst({
      where: { userId, routineId: { in: routineIds } },
      orderBy: { createdAt: 'desc' },
      select: { routineId: true },
    });

    return {
      program,
      nextRoutineId: nextInRotation(routineIds, last?.routineId ?? null),
    };
  }

  async setActive(userId: string, programId: string | null) {
    if (programId) {
      await this.findOne(programId, userId);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeProgramId: programId },
    });

    return { activeProgramId: programId };
  }

  private async assertOwnRoutines(userId: string, routineIds: string[]) {
    const owned = await this.prisma.routine.count({
      where: { id: { in: routineIds }, userId },
    });

    if (owned !== routineIds.length) {
      throw new NotFoundException('Routine not found');
    }
  }

  private async assignRoutines(
    tx: Prisma.TransactionClient,
    programId: string,
    routineIds: string[],
  ) {
    for (const [programPosition, id] of routineIds.entries()) {
      await tx.routine.update({
        where: { id },
        data: { programId, programPosition },
      });
    }
  }

  private async releaseRoutines(
    tx: Prisma.TransactionClient,
    programId: string,
  ) {
    await tx.routine.updateMany({
      where: { programId },
      data: { programId: null, programPosition: null },
    });
  }

  private async withUniqueName<T>(run: () => Promise<T>) {
    try {
      return await run();
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Program name already exists');
      }
      throw e;
    }
  }
}
