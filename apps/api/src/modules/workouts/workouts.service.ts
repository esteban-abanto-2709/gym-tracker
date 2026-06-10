import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { localDayRangeUtc, toLocalDateString } from '@/common/timezone.util';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkoutDto: CreateWorkoutDto) {
    return this.prisma.workout.create({
      data: {
        exerciseId: createWorkoutDto.exerciseId,
        reps: createWorkoutDto.reps,
        weight: createWorkoutDto.weight,
        opinion: createWorkoutDto.opinion || '',
      },
    });
  }

  async findDistinctDates() {
    const workouts = await this.prisma.workout.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const uniqueDates = new Set<string>();
    workouts.forEach((w) => {
      uniqueDates.add(toLocalDateString(w.createdAt));
    });

    return Array.from(uniqueDates);
  }

  async findAll(dateStr?: string) {
    const where: Prisma.WorkoutWhereInput = {};
    if (dateStr) {
      const { start, end } = localDayRangeUtc(dateStr);
      where.createdAt = {
        gte: start,
        lte: end,
      };
    }

    return this.prisma.workout.findMany({
      where,
      include: {
        exercise: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateWorkoutDto: UpdateWorkoutDto) {
    return this.prisma.workout.update({
      where: { id },
      data: updateWorkoutDto,
    });
  }

  async remove(id: string) {
    return this.prisma.workout.delete({
      where: { id },
    });
  }
}
