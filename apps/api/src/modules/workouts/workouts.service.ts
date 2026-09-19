import { Injectable, NotFoundException } from '@nestjs/common';
import { SetType } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { toLocalDateString } from '@/common/timezone.util';

const REP_MARGIN = 3;
const WEIGHT_STEP_KG = 2.5;

type SetMeasure = 'weight_reps' | 'reps' | 'time';

function measureOf(set: {
  weight: number | null;
  durationSec: number | null;
}): SetMeasure {
  if (set.durationSec != null) return 'time';
  if (set.weight == null) return 'reps';
  return 'weight_reps';
}

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createWorkoutDto: CreateWorkoutDto) {
    return this.prisma.workout.create({
      data: {
        userId,
        exerciseId: createWorkoutDto.exerciseId,
        reps: createWorkoutDto.reps,
        weight: createWorkoutDto.weight ?? null,
        durationSec: createWorkoutDto.durationSec ?? null,
        opinion: createWorkoutDto.opinion || '',
        equipmentId: createWorkoutDto.equipmentId ?? null,
        routineId: createWorkoutDto.routineId ?? null,
        isApproximation: createWorkoutDto.isApproximation ?? false,
        setType: createWorkoutDto.setType ?? SetType.WORKING,
        step: createWorkoutDto.step ?? null,
      },
    });
  }

  async getRecommendation(
    userId: string,
    exerciseId: string,
    tz?: string,
    equipmentId?: string,
    setType: SetType = SetType.WORKING,
    step?: number,
  ) {
    // El peso no es comparable entre equipos: la recomendación se hace solo
    // sobre los sets del mismo equipo (equipmentId vacío => "sin especificar").
    const [sets, latestAny, working] = await Promise.all([
      this.prisma.workout.findMany({
        where: {
          userId,
          exerciseId,
          equipmentId: equipmentId || null,
          setType,
          ...(step != null ? { step } : {}),
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workout.findFirst({
        where: { userId, exerciseId },
        orderBy: { createdAt: 'desc' },
        select: { weight: true, durationSec: true },
      }),
      setType === SetType.RAMP
        ? this.prisma.workout.findFirst({
            where: {
              userId,
              exerciseId,
              equipmentId: equipmentId || null,
              setType: SetType.WORKING,
              weight: { not: null },
            },
            orderBy: { createdAt: 'desc' },
            select: { weight: true },
          })
        : null,
    ]);
    const lastMeasure = latestAny ? measureOf(latestAny) : null;
    const workingWeight = working?.weight ?? null;

    if (sets.length === 0) {
      return {
        lastWeight: null,
        lastReps: null,
        lastDurationSec: null,
        suggestedWeight: null,
        lastMeasure,
        workingWeight,
      };
    }

    const last = sets[0];
    const trackWeight = last.weight;

    // Best reps achieved at the current working weight, per local day.
    const bestRepsByDay = new Map<string, number>();
    for (const s of sets) {
      if (s.weight !== trackWeight) continue;
      const day = toLocalDateString(s.createdAt, tz);
      bestRepsByDay.set(day, Math.max(bestRepsByDay.get(day) ?? 0, s.reps));
    }

    // Suggest going up when the latest day at this weight beats the previous
    // day at this weight by the margin. Different weight => fresh track.
    const days = [...bestRepsByDay.keys()].sort().reverse();
    let suggestedWeight: number | null = null;
    if (trackWeight != null && days.length >= 2) {
      const bestNow = bestRepsByDay.get(days[0]) ?? 0;
      const bestPrev = bestRepsByDay.get(days[1]) ?? 0;
      if (bestNow >= bestPrev + REP_MARGIN) {
        suggestedWeight = trackWeight + WEIGHT_STEP_KG;
      }
    }

    return {
      lastWeight: last.weight,
      lastReps: last.reps,
      lastDurationSec: last.durationSec,
      suggestedWeight,
      lastMeasure,
      workingWeight,
    };
  }

  async findAll(userId: string) {
    return this.prisma.workout.findMany({
      where: { userId },
      include: {
        exercise: true,
        equipment: true,
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
