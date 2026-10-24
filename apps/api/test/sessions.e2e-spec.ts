import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const MIN = 60 * 1000;

const todayUtc = new Date();
todayUtc.setUTCHours(0, 0, 0, 0);
const elevenPmLima = new Date(todayUtc.getTime() - 20 * 60 * MIN);
const halfPastMidnightLima = new Date(elevenPmLima.getTime() + 90 * MIN);

type Agent = ReturnType<typeof request.agent>;

describe('Sessions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let exerciseId: string;
  const users: { agent: Agent; id: string }[] = [];

  const register = async (n: number) => {
    const agent = request.agent(app.getHttpServer());
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-sessions-${n}-${stamp}@test.local`,
        username: `e2esessions${n}${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    users.push({ agent, id: (res.body as { id: string }).id });
  };

  const logSet = (agent: Agent, extra: Record<string, unknown> = {}) =>
    agent
      .post('/workouts')
      .send({ exerciseId, reps: 8, weight: 40, ...extra })
      .expect(201)
      .then((res) => res.body as { id: string; sessionId: string });

  const sessionsOf = (userId: string) =>
    prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: 'asc' },
    });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    exerciseId = (
      await prisma.exercise.findFirstOrThrow({ where: { createdById: null } })
    ).id;
    for (const n of [1, 2, 3]) await register(n);
  });

  afterAll(async () => {
    const ids = users.map((u) => u.id);
    await prisma.workout.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await app.close();
  });

  describe('a session that crosses midnight', () => {
    const sessionId = randomUUID();
    let first: { id: string; sessionId: string };
    let second: { id: string; sessionId: string };

    it('keeps both sets in one session with its timezone', async () => {
      const { agent, id } = users[0];
      first = await logSet(agent, {
        sessionId,
        performedAt: elevenPmLima.toISOString(),
        timeZone: 'America/Lima',
      });
      second = await logSet(agent, {
        sessionId,
        performedAt: halfPastMidnightLima.toISOString(),
        timeZone: 'America/Lima',
      });

      expect(second.sessionId).toBe(first.sessionId);
      const [session] = await sessionsOf(id);
      expect(session).toMatchObject({
        clientId: sessionId,
        startedAt: elevenPmLima,
        endedAt: halfPastMidnightLima,
        timeZone: 'America/Lima',
      });
    });

    it('deleting its first set moves the start of the session', async () => {
      await users[0].agent.delete(`/workouts/${first.id}`).expect(200);
      const session = await prisma.session.findUniqueOrThrow({
        where: { id: second.sessionId },
      });
      expect(session.startedAt).toEqual(halfPastMidnightLima);
    });

    it('deleting its last set removes the session', async () => {
      await users[0].agent.delete(`/workouts/${second.id}`).expect(200);
      expect(
        await prisma.session.count({ where: { id: second.sessionId } }),
      ).toBe(0);
    });
  });

  it('the same set sent twice is saved once', async () => {
    const clientId = randomUUID();
    const sessionId = randomUUID();
    const a = await logSet(users[0].agent, { clientId, sessionId });
    const b = await logSet(users[0].agent, { clientId, sessionId });
    expect(b.id).toBe(a.id);
    expect(
      await prisma.workout.count({ where: { userId: users[0].id, clientId } }),
    ).toBe(1);
  });

  it('a set time far in the future is replaced by the server time', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * MIN);
    const set = await logSet(users[0].agent, {
      sessionId: randomUUID(),
      performedAt: tomorrow.toISOString(),
    });
    const saved = await prisma.workout.findUniqueOrThrow({
      where: { id: set.id },
    });
    expect(Math.abs(saved.createdAt.getTime() - Date.now())).toBeLessThan(MIN);
  });

  it('an unknown timezone falls back to the default one', async () => {
    const set = await logSet(users[0].agent, {
      sessionId: randomUUID(),
      timeZone: 'Mars/Olympus',
    });
    const session = await prisma.session.findUniqueOrThrow({
      where: { id: set.sessionId },
    });
    expect(session.timeZone).toBe('America/Lima');
  });

  it('without a session id, a gap over 3 hours opens a new session', async () => {
    const { agent, id } = users[1];
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * MIN);
    await logSet(agent, { performedAt: fiveHoursAgo.toISOString() });
    await logSet(agent);
    await logSet(agent);

    const sessions = await sessionsOf(id);
    expect(sessions).toHaveLength(2);
    expect(
      await prisma.workout.count({ where: { sessionId: sessions[1].id } }),
    ).toBe(2);
  });

  it('a session id is private to each user', async () => {
    const sessionId = randomUUID();
    const mine = await logSet(users[0].agent, { sessionId });
    const theirs = await logSet(users[2].agent, { sessionId });

    expect(theirs.sessionId).not.toBe(mine.sessionId);
    const session = await prisma.session.findUniqueOrThrow({
      where: { id: theirs.sessionId },
    });
    expect(session.userId).toBe(users[2].id);
  });
});
