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
const DAY = 24 * 60 * MIN;

type Agent = ReturnType<typeof request.agent>;
type SessionRow = { id: string; startedAt: string; sets: number };
type Page = {
  sessions: SessionRow[];
  next: string | null;
  first: string | null;
};

describe('GET /sessions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let exerciseId: string;
  let routineId: string;
  const users: { agent: Agent; id: string }[] = [];

  const register = async (n: number) => {
    const agent = request.agent(app.getHttpServer());
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-session-list-${n}-${stamp}@test.local`,
        username: `e2esessionlist${n}${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    users.push({ agent, id: (res.body as { id: string }).id });
  };

  const logSession = async (
    agent: Agent,
    times: Date[],
    extra: Record<string, unknown> = {},
  ) => {
    const sessionId = randomUUID();
    for (const at of times) {
      await agent
        .post('/workouts')
        .send({
          exerciseId,
          reps: 10,
          weight: 60,
          sessionId,
          performedAt: at.toISOString(),
          timeZone: 'America/Lima',
          ...extra,
        })
        .expect(201);
    }
  };

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
    await register(1);
    await register(2);
    await register(3);

    const now = Date.now();
    for (const daysAgo of [3, 2, 1]) {
      const start = now - daysAgo * DAY;
      await logSession(users[0].agent, [
        new Date(start),
        new Date(start + 10 * MIN),
      ]);
    }

    const routine = await users[2].agent
      .post('/routines')
      .send({
        name: `E2E streak ${stamp}`,
        items: [
          {
            exerciseId,
            position: 0,
            blocks: [{ kind: 'weight_reps', sets: 3, reps: 8, repsMax: 10 }],
          },
        ],
      })
      .expect(201);
    routineId = (routine.body as { id: string }).id;
  });

  afterAll(async () => {
    const ids = users.map((u) => u.id);
    await prisma.workout.deleteMany({ where: { userId: { in: ids } } });
    await prisma.routineItem.deleteMany({
      where: { routine: { userId: { in: ids } } },
    });
    await prisma.routine.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await app.close();
  });

  it('pages through the sessions, newest first', async () => {
    const first = (await users[0].agent.get('/sessions?limit=2').expect(200))
      .body as Page;
    expect(first.sessions).toHaveLength(2);
    expect(first.sessions.map((s) => s.sets)).toEqual([2, 2]);
    expect(first.next).toBe(first.sessions[1].startedAt);

    const second = (
      await users[0].agent
        .get(`/sessions?limit=2&before=${encodeURIComponent(first.next!)}`)
        .expect(200)
    ).body as Page;
    expect(second.sessions).toHaveLength(1);
    expect(second.next).toBeNull();
    expect(first.first).toBe(second.sessions[0].startedAt);
    expect(second.first).toBeNull();
    expect(new Date(second.sessions[0].startedAt).getTime()).toBeLessThan(
      new Date(first.sessions[1].startedAt).getTime(),
    );
  });

  it('returns one session with its sets', async () => {
    const page = (await users[0].agent.get('/sessions').expect(200))
      .body as Page;
    const res = await users[0].agent
      .get(`/sessions/${page.sessions[0].id}`)
      .expect(200);
    const body = res.body as {
      timeZone: string;
      sets: { exercise: { name: string } }[];
    };
    expect(body.timeZone).toBe('America/Lima');
    expect(body.sets).toHaveLength(2);
    expect(typeof body.sets[0].exercise.name).toBe('string');
  });

  it('a session of another user is not found', async () => {
    const page = (await users[0].agent.get('/sessions').expect(200))
      .body as Page;
    await users[1].agent.get(`/sessions/${page.sessions[0].id}`).expect(404);
    const theirs = (await users[1].agent.get('/sessions').expect(200))
      .body as Page;
    expect(theirs.sessions).toHaveLength(0);
    expect(theirs.first).toBeNull();
  });

  it('rejects a page size out of range', async () => {
    await users[0].agent.get('/sessions?limit=500').expect(400);
  });

  it('a routine session that crosses midnight counts once in the streak', async () => {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const elevenPmLima = todayUtc.getTime() - 20 * 60 * MIN;
    const earlier = elevenPmLima - 3 * DAY;
    await logSession(
      users[2].agent,
      [0, 5, 10].map((m) => new Date(earlier + m * MIN)),
      { routineId },
    );
    await logSession(
      users[2].agent,
      [0, 40, 80].map((m) => new Date(elevenPmLima + m * MIN)),
      { routineId },
    );

    const res = await users[2].agent
      .get(
        `/workouts/progress?exerciseId=${exerciseId}&routineId=${routineId}&tz=America/Lima`,
      )
      .expect(200);
    const body = res.body as { streak: number; sessions: unknown[] };
    expect(body.sessions).toHaveLength(2);
    expect(body.streak).toBe(2);
  });
});
