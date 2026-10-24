import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SetType } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { FALLBACK_TIMEZONE, isValidTimeZone } from '@/common/timezone.util';
import { continuesSession, setTime } from './session-rules';
import { normalizeBlock, type BlockInput } from '../routines/blocks';
import { computeStreak, groupSessions, type StreakTarget } from './streak';

const PROGRESS_HISTORY_SETS = 300;

export const WORKOUT_INCLUDE = {
  exercise: { include: { names: true } },
  equipment: true,
  routine: { select: { name: true } },
} as const;

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
    const clientId = createWorkoutDto.clientId ?? null;
    const { routineId } = createWorkoutDto;
    if (
      routineId &&
      !(await this.prisma.routine.count({ where: { id: routineId, userId } }))
    ) {
      throw new NotFoundException('Routine not found');
    }
    for (let attempt = 0; ; attempt++) {
      if (clientId) {
        const existing = await this.prisma.workout.findUnique({
          where: { userId_clientId: { userId, clientId } },
        });
        if (existing) return existing;
      }
      try {
        return await this.prisma.$transaction(async (tx) => {
          const createdAt = setTime(createWorkoutDto.performedAt, new Date());
          const sessionId = await this.sessionFor(
            tx,
            userId,
            createWorkoutDto,
            createdAt,
          );
          return this.insert(
            tx,
            userId,
            createWorkoutDto,
            clientId,
            sessionId,
            createdAt,
          );
        });
      } catch (e) {
        const conflict =
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002';
        if (!conflict || attempt > 0) throw e;
      }
    }
  }

  private async sessionFor(
    tx: Prisma.TransactionClient,
    userId: string,
    dto: CreateWorkoutDto,
    setAt: Date,
  ) {
    const timeZone =
      dto.timeZone && isValidTimeZone(dto.timeZone)
        ? dto.timeZone
        : FALLBACK_TIMEZONE;
    const session = dto.sessionId
      ? await tx.session.findUnique({
          where: { userId_clientId: { userId, clientId: dto.sessionId } },
        })
      : await tx.session.findFirst({
          where: { userId },
          orderBy: { startedAt: 'desc' },
        });

    if (
      !session ||
      (!dto.sessionId && !continuesSession(session.endedAt, setAt))
    ) {
      const created = await tx.session.create({
        data: {
          userId,
          clientId: dto.sessionId ?? null,
          routineId: dto.routineId ?? null,
          startedAt: setAt,
          endedAt: setAt,
          timeZone,
        },
      });
      return created.id;
    }

    if (setAt < session.startedAt || setAt > session.endedAt) {
      await tx.session.update({
        where: { id: session.id },
        data: {
          startedAt: setAt < session.startedAt ? setAt : session.startedAt,
          endedAt: setAt > session.endedAt ? setAt : session.endedAt,
        },
      });
    }
    return session.id;
  }

  private async refreshSession(
    tx: Prisma.TransactionClient,
    sessionId: string,
  ) {
    const { _min, _max } = await tx.workout.aggregate({
      where: { sessionId },
      _min: { createdAt: true },
      _max: { createdAt: true },
    });
    if (!_min.createdAt || !_max.createdAt) {
      await tx.session.delete({ where: { id: sessionId } });
    } else {
      await tx.session.update({
        where: { id: sessionId },
        data: { startedAt: _min.createdAt, endedAt: _max.createdAt },
      });
    }
  }

  private insert(
    tx: Prisma.TransactionClient,
    userId: string,
    createWorkoutDto: CreateWorkoutDto,
    clientId: string | null,
    sessionId: string,
    createdAt: Date,
  ) {
    return tx.workout.create({
      data: {
        clientId,
        sessionId,
        createdAt,
        userId,
        exerciseId: createWorkoutDto.exerciseId,
        reps:
          createWorkoutDto.durationSec != null
            ? null
            : (createWorkoutDto.reps ?? null),
        weight: createWorkoutDto.weight ?? null,
        durationSec: createWorkoutDto.durationSec ?? null,
        opinion: createWorkoutDto.opinion || '',
        equipmentId: createWorkoutDto.equipmentId ?? null,
        routineId: createWorkoutDto.routineId ?? null,
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
    const [last, latestAny, working] = await Promise.all([
      this.prisma.workout.findFirst({
        where: {
          userId,
          exerciseId,
          equipmentId: equipmentId || null,
          setType,
          ...(step != null ? { step } : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: { weight: true, reps: true, durationSec: true },
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

    return {
      lastWeight: last?.weight ?? null,
      lastReps: last?.reps ?? null,
      lastDurationSec: last?.durationSec ?? null,
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
          durationSec: true,
          routineId: true,
          sessionId: true,
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
    const streak = target ? computeStreak(sessions, target, new Date()) : null;

    return {
      target,
      streak: streak?.streak ?? null,
      suggestion: streak?.suggestion ?? null,
      sessions,
    };
  }

  async findAll(userId: string, from: string, to: string) {
    return this.prisma.workout.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(from), lt: new Date(to) },
      },
      include: WORKOUT_INCLUDE,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDays(userId: string, tz: string = FALLBACK_TIMEZONE) {
    const rows = await this.prisma.$queryRaw<{ day: string; start: Date }[]>`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${tz}, 'YYYY-MM-DD') AS day,
             min("createdAt") AS start
      FROM "Workout"
      WHERE "userId" = ${userId}
      GROUP BY day
      ORDER BY day DESC`;
    const days = rows.map((r) => r.day);
    if (days.length === 0) return { days, sets: [] };

    const sets = await this.prisma.workout.findMany({
      where: { userId, createdAt: { gte: rows[0].start } },
      include: WORKOUT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return { days, sets };
  }

  async update(id: string, userId: string, updateWorkoutDto: UpdateWorkoutDto) {
    await this.ensureOwned(id, userId);
    return this.prisma.workout.update({
      where: { id },
      data:
        updateWorkoutDto.durationSec != null
          ? { ...updateWorkoutDto, reps: null }
          : updateWorkoutDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwned(id, userId);
    return this.prisma.$transaction(async (tx) => {
      const removed = await tx.workout.delete({ where: { id } });
      if (removed.sessionId) await this.refreshSession(tx, removed.sessionId);
      return removed;
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
