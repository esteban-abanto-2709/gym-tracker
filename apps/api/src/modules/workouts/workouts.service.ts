import { Injectable, NotFoundException } from '@nestjs/common';
import { SetType } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { toLocalDateString } from '@/common/timezone.util';
import { normalizeBlock, type BlockInput } from '../routines/blocks';
import { computeStreak, groupSessions, type StreakTarget } from './streak';

const PROGRESS_HISTORY_SETS = 300;
const PROGRESS_SESSIONS = 10;

type SetMeasure = 'weight_reps' | 'reps' | 'time';

function measureOf(set: {
  weight: number | null;
  durationSec: number | null;
}): SetMeasure {
  if (set.durationSec != null) return 'time';
  if (set.weight == null) return 'reps';
  return 'weight_reps';
}

function targetOf(blocks: unknown): StreakTarget | null {
  if (!Array.isArray(blocks)) return null;
  const block = (blocks as BlockInput[])
    .map(normalizeBlock)
    .find((b) => b.kind === 'weight_reps');
  if (!block || block.kind !== 'weight_reps' || block.reps == null) return null;
  return { sets: block.sets ?? 1, reps: block.reps, repsMax: block.repsMax };
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

  async getProgress(
    userId: string,
    exerciseId: string,
    routineId?: string,
    tz?: string,
  ) {
    const [sets, item] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId, exerciseId, setType: SetType.WORKING },
        orderBy: { createdAt: 'desc' },
        take: PROGRESS_HISTORY_SETS,
        select: {
          weight: true,
          reps: true,
          routineId: true,
          equipmentId: true,
          equipment: { select: { name: true } },
          createdAt: true,
        },
      }),
      routineId
        ? this.prisma.routineItem.findFirst({
            where: { routineId, exerciseId, routine: { userId } },
            orderBy: { position: 'asc' },
            select: { blocks: true },
          })
        : null,
    ]);

    const sessions = groupSessions(sets, tz);
    const target = item ? targetOf(item.blocks) : null;
    const streak = target
      ? computeStreak(sessions, target, toLocalDateString(new Date(), tz))
      : null;

    return {
      target,
      streak: streak?.streak ?? null,
      suggestion: streak?.suggestion ?? null,
      sessions: sessions.slice(0, PROGRESS_SESSIONS),
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
