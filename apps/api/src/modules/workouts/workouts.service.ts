import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { toLocalDateString } from '@/common/timezone.util';

const REP_MARGIN = 3;
const WEIGHT_STEP_KG = 2.5;

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createWorkoutDto: CreateWorkoutDto) {
    return this.prisma.workout.create({
      data: {
        userId,
        exerciseId: createWorkoutDto.exerciseId,
        reps: createWorkoutDto.reps,
        weight: createWorkoutDto.weight,
        opinion: createWorkoutDto.opinion || '',
        routineId: createWorkoutDto.routineId ?? null,
        isApproximation: createWorkoutDto.isApproximation ?? false,
      },
    });
  }

  async getRecommendation(
    userId: string,
    exerciseId: string,
    isApproximation: boolean,
    tz?: string,
  ) {
    const sets = await this.prisma.workout.findMany({
      where: { userId, exerciseId, isApproximation },
      orderBy: { createdAt: 'desc' },
    });

    if (sets.length === 0) {
      return { lastWeight: null, lastReps: null, suggestedWeight: null };
    }

    const last = sets[0];
    const workingWeight = last.weight;

    // Best reps achieved at the current working weight, per local day.
    const bestRepsByDay = new Map<string, number>();
    for (const s of sets) {
      if (s.weight !== workingWeight) continue;
      const day = toLocalDateString(s.createdAt, tz);
      bestRepsByDay.set(day, Math.max(bestRepsByDay.get(day) ?? 0, s.reps));
    }

    // Suggest going up when the latest day at this weight beats the previous
    // day at this weight by the margin. Different weight => fresh track.
    const days = [...bestRepsByDay.keys()].sort().reverse();
    let suggestedWeight: number | null = null;
    if (days.length >= 2) {
      const bestNow = bestRepsByDay.get(days[0]) ?? 0;
      const bestPrev = bestRepsByDay.get(days[1]) ?? 0;
      if (bestNow >= bestPrev + REP_MARGIN) {
        suggestedWeight = workingWeight + WEIGHT_STEP_KG;
      }
    }

    return { lastWeight: last.weight, lastReps: last.reps, suggestedWeight };
  }

  async findAll(userId: string) {
    return this.prisma.workout.findMany({
      where: { userId },
      include: {
        exercise: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, userId: string, updateWorkoutDto: UpdateWorkoutDto) {
    await this.ensureOwned(id, userId);
    return this.prisma.workout.update({
      where: { id },
      data: updateWorkoutDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwned(id, userId);
    return this.prisma.workout.delete({
      where: { id },
    });
  }

  private async ensureOwned(id: string, userId: string) {
    const found = await this.prisma.workout.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) {
      throw new NotFoundException(`Workout ${id} not found`);
    }
  }
}
