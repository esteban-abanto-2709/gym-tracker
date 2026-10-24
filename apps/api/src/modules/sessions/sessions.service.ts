import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { WORKOUT_INCLUDE } from '../workouts/workouts.service';

const DEFAULT_PAGE = 20;

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, before?: string, limit = DEFAULT_PAGE) {
    const rows = await this.prisma.session.findMany({
      where: {
        userId,
        ...(before ? { startedAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: limit + 1,
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        timeZone: true,
        routine: { select: { id: true, name: true } },
      },
    });
    const page = rows.slice(0, limit);
    const counts = await this.prisma.workout.groupBy({
      by: ['sessionId'],
      where: { sessionId: { in: page.map((s) => s.id) } },
      _count: true,
    });
    const setsOf = new Map(counts.map((c) => [c.sessionId, c._count]));
    const first = before
      ? null
      : await this.prisma.session.findFirst({
          where: { userId },
          orderBy: { startedAt: 'asc' },
          select: { startedAt: true },
        });
    return {
      first: first?.startedAt ?? null,
      sessions: page.map((session) => ({
        ...session,
        sets: setsOf.get(session.id) ?? 0,
      })),
      next: rows.length > limit ? page[page.length - 1].startedAt : null,
    };
  }

  async findOne(userId: string, id: string) {
    const session = await this.prisma.session.findFirst({
      where: { id, userId },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        timeZone: true,
        routine: { select: { id: true, name: true } },
        workouts: { include: WORKOUT_INCLUDE, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    const { workouts, ...rest } = session;
    return { ...rest, sets: workouts };
  }
}
