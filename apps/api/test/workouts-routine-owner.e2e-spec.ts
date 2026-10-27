import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();

describe('WorkoutsController routine ownership (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let owner: ReturnType<typeof request.agent>;
  let intruder: ReturnType<typeof request.agent>;
  const userIds: string[] = [];
  let exerciseId: string;
  let routineId: string;

  const register = async (
    agent: ReturnType<typeof request.agent>,
    n: number,
  ) => {
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-owner-${n}-${stamp}@test.local`,
        username: `e2eowner${n}${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    userIds.push((res.body as { id: string }).id);
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

    owner = request.agent(app.getHttpServer());
    intruder = request.agent(app.getHttpServer());
    await register(owner, 1);
    await register(intruder, 2);

    exerciseId = (
      await prisma.exercise.findFirstOrThrow({ where: { createdById: null } })
    ).id;
    const routine = await owner
      .post('/routines')
      .send({
        name: `E2E owner ${stamp}`,
        items: [{ exerciseId, position: 0, blocks: [] }],
      })
      .expect(201);
    routineId = routine.body.id;
  });

  afterAll(async () => {
    await prisma.workout.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.routineItem.deleteMany({
      where: { routine: { userId: { in: userIds } } },
    });
    await prisma.routine.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  it('logs a set in your own routine', async () => {
    await owner
      .post('/workouts')
      .send({ exerciseId, reps: 10, weight: 20, routineId })
      .expect(201);
  });

  it('rejects a set pointing at somebody else routine', async () => {
    await intruder
      .post('/workouts')
      .send({ exerciseId, reps: 10, weight: 20, routineId })
      .expect(404);
    expect(await prisma.workout.count({ where: { routineId } })).toBe(1);
  });

  it('saves a set of a deleted routine as a free-day set', async () => {
    const gone = await owner
      .post('/routines')
      .send({
        name: `E2E gone ${stamp}`,
        items: [{ exerciseId, position: 0, blocks: [] }],
      })
      .expect(201);
    await owner.delete(`/routines/${gone.body.id}`).expect(200);

    const res = await owner
      .post('/workouts')
      .send({ exerciseId, reps: 10, weight: 20, routineId: gone.body.id })
      .expect(201);
    expect(res.body.routineId).toBeNull();
  });

  it('saves a set of a deleted equipment without equipment', async () => {
    const equipment = await prisma.equipment.create({
      data: { name: `e2e-gone-${stamp}` },
    });
    await prisma.equipment.delete({ where: { id: equipment.id } });

    const res = await owner
      .post('/workouts')
      .send({ exerciseId, reps: 10, weight: 20, equipmentId: equipment.id })
      .expect(201);
    expect(res.body.equipmentId).toBeNull();
  });
});
