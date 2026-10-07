import { Injectable, NotFoundException } from '@nestjs/common';
import { SetType } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

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
        lastMeasure,
        workingWeight,
      };
    }

    const last = sets[0];
    return {
      lastWeight: last.weight,
      lastReps: last.reps,
      lastDurationSec: last.durationSec,
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
