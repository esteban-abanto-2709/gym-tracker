import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { CreateRoutineDto, RoutineItemDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

const itemsInclude = {
  items: {
    include: { exercise: true },
    orderBy: { position: 'asc' as const },
  },
};

@Injectable()
export class RoutinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoutineDto: CreateRoutineDto) {
    // ponytail: interim single-owner; replace with authenticated user in Paso 4
    const { id: userId } = await this.prisma.user.findFirstOrThrow();
    return this.prisma.routine.create({
      data: {
        userId,
        name: createRoutineDto.name,
        items: { create: this.mapItems(createRoutineDto.items) },
      },
      include: itemsInclude,
    });
  }

  async findAll() {
    return this.prisma.routine.findMany({
      include: itemsInclude,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const routine = await this.prisma.routine.findUnique({
      where: { id },
      include: itemsInclude,
    });

    if (!routine) {
      throw new NotFoundException(`Routine ${id} not found`);
    }

    return routine;
  }

  async update(id: string, updateRoutineDto: UpdateRoutineDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      if (updateRoutineDto.items) {
        await tx.routineItem.deleteMany({ where: { routineId: id } });
        await tx.routineItem.createMany({
          data: this.mapItems(updateRoutineDto.items).map((item) => ({
            ...item,
            routineId: id,
          })),
        });
      }

      return tx.routine.update({
        where: { id },
        data: updateRoutineDto.name ? { name: updateRoutineDto.name } : {},
        include: itemsInclude,
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.routine.delete({ where: { id } });
  }

  private mapItems(items: RoutineItemDto[]) {
    return items.map((item) => ({
      exerciseId: item.exerciseId,
      position: item.position,
      targetSets: item.targetSets ?? null,
      targetReps: item.targetReps ?? null,
      isApproximation: item.isApproximation ?? false,
    }));
  }
}
