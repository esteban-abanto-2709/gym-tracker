import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const password = 'e2e-password';
type Agent = ReturnType<typeof request.agent>;

describe('AuthController DELETE /auth/me (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let leaver: Agent;
  let stayer: Agent;
  let leaverId: string;
  let stayerId: string;
  let googleOnlyId: string;
  let leaverCookie: string;
  let unusedExerciseId: string;
  let sharedExerciseId: string;
  let routineId: string;

  const register = async (agent: Agent, name: string) => {
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-${name}-${stamp}@test.local`,
        username: `e2e${name}${stamp}`,
        password,
      })
      .expect(201);
    return {
      id: (res.body as { id: string }).id,
      cookie: res.get('Set-Cookie')![0].split(';')[0],
    };
  };
  const createExercise = async (agent: Agent, name: string) =>
    (
      (
        await agent
          .post('/exercises')
          .send({ name: `${name} ${stamp}` })
          .expect(201)
      ).body as { id: string }
    ).id;

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

    leaver = request.agent(app.getHttpServer());
    stayer = request.agent(app.getHttpServer());
    const l = await register(leaver, 'leaver');
    leaverId = l.id;
    leaverCookie = l.cookie;
    stayerId = (await register(stayer, 'stayer')).id;

    unusedExerciseId = await createExercise(leaver, 'E2E unused');
    sharedExerciseId = await createExercise(leaver, 'E2E shared');

    const routine = await leaver
      .post('/routines')
      .send({
        name: `E2E leaver ${stamp}`,
        items: [{ exerciseId: unusedExerciseId, position: 0, blocks: [] }],
      })
      .expect(201);
    routineId = (routine.body as { id: string }).id;
    await leaver
      .post('/programs')
      .send({ name: `E2E leaver ${stamp}`, routineIds: [routineId] })
      .expect(201);
    await leaver
      .post('/workouts')
      .send({ exerciseId: unusedExerciseId, reps: 10, weight: 20, routineId })
      .expect(201);
    await prisma.bodyMeasurement.create({
      data: { userId: leaverId, date: new Date('2026-01-01'), weightKg: 80 },
    });

    await stayer
      .post('/workouts')
      .send({ exerciseId: sharedExerciseId, reps: 8, weight: 30 })
      .expect(201);

    googleOnlyId = (
      await prisma.user.create({
        data: {
          email: `e2e-google-only-${stamp}@test.local`,
          username: 'e2e google only',
          slug: `e2e-google-only-${stamp}`,
          googleId: `google-only-${stamp}`,
        },
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.workout.deleteMany({ where: { userId: stayerId } });
    await prisma.exercise.deleteMany({ where: { id: sharedExerciseId } });
    await prisma.user.deleteMany({
      where: { id: { in: [leaverId, stayerId, googleOnlyId] } },
    });
    await app.close();
  });

  it('refuses without the right password', async () => {
    await leaver.delete('/auth/me').send({}).expect(403);
    await leaver
      .delete('/auth/me')
      .send({ password: 'not-my-password' })
      .expect(403);
    expect(await prisma.user.count({ where: { id: leaverId } })).toBe(1);
  });

  it('deletes everything of the user and only the exercises nobody else uses', async () => {
    await leaver.delete('/auth/me').send({ password }).expect(200);

    expect(await prisma.user.count({ where: { id: leaverId } })).toBe(0);
    expect(await prisma.workout.count({ where: { userId: leaverId } })).toBe(0);
    expect(await prisma.routine.count({ where: { userId: leaverId } })).toBe(0);
    expect(await prisma.program.count({ where: { userId: leaverId } })).toBe(0);
    expect(
      await prisma.bodyMeasurement.count({ where: { userId: leaverId } }),
    ).toBe(0);
    expect(
      await prisma.exercise.count({ where: { id: unusedExerciseId } }),
    ).toBe(0);

    const shared = await prisma.exercise.findUniqueOrThrow({
      where: { id: sharedExerciseId },
    });
    expect(shared.createdById).toBeNull();
    expect(await prisma.workout.count({ where: { userId: stayerId } })).toBe(1);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', leaverCookie)
      .expect(401);
  });

  it('asks a Google-only account to type its email', async () => {
    const token = app.get(JwtService).sign({ sub: googleOnlyId, ver: 0 });
    const del = (body: object) =>
      request(app.getHttpServer())
        .delete('/auth/me')
        .set('Cookie', `token=${token}`)
        .send(body);

    await del({ email: 'someone-else@test.local' }).expect(403);
    await del({
      email: ` E2E-Google-Only-${stamp}@test.local `,
    }).expect(200);
    expect(await prisma.user.count({ where: { id: googleOnlyId } })).toBe(0);
  });
});
