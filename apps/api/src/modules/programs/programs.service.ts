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
