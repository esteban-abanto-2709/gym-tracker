import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { localDayRangeUtc, toLocalDateString } from '@/common/timezone.util';

const REP_MARGIN = 3;
const WEIGHT_STEP_KG = 2.5;

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
        routineId: createWorkoutDto.routineId ?? null,
        isApproximation: createWorkoutDto.isApproximation ?? false,
      },
    });
  }

  async getRecommendation(exerciseId: string, isApproximation: boolean) {
    const sets = await this.prisma.workout.findMany({
      where: { exerciseId, isApproximation },
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
      const day = toLocalDateString(s.createdAt);
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
