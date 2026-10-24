import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();

type DaysBody = { days: string[]; sets: { createdAt: string }[] };

describe('GET /workouts/days (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let agent: ReturnType<typeof request.agent>;
  let userId: string;

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

    agent = request.agent(app.getHttpServer());
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-days-${stamp}@test.local`,
        username: `e2edays${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    userId = (res.body as { id: string }).id;

    const exerciseId = (
      await prisma.exercise.findFirstOrThrow({ where: { createdById: null } })
    ).id;
    await prisma.workout.createMany({
      data: [
        '2026-10-09T02:00:00Z',
        '2026-10-08T14:00:00Z',
        '2026-10-06T15:00:00Z',
      ].map((iso) => ({
        userId,
        exerciseId,
        reps: 10,
        weight: 20,
        opinion: '',
        createdAt: new Date(iso),
      })),
    });
  });

  afterAll(async () => {
    await prisma.workout.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('groups sets by the local day of the given timezone', async () => {
    const res = await agent.get('/workouts/days?tz=America/Lima').expect(200);
    const body = res.body as DaysBody;

    expect(body.days).toEqual(['2026-10-08', '2026-10-06']);
    expect(body.sets.map((s) => s.createdAt)).toEqual([
      '2026-10-09T02:00:00.000Z',
      '2026-10-08T14:00:00.000Z',
    ]);
  });

  it('the same sets fall on other days in UTC', async () => {
    const res = await agent.get('/workouts/days?tz=UTC').expect(200);
    const body = res.body as DaysBody;

    expect(body.days).toEqual(['2026-10-09', '2026-10-08', '2026-10-06']);
    expect(body.sets).toHaveLength(1);
  });
});
