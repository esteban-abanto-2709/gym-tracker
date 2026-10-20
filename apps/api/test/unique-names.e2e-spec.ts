import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
type Agent = ReturnType<typeof request.agent>;

describe('Routine and program names are unique per user (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let owner: Agent;
  let other: Agent;
  const userIds: string[] = [];
  let exerciseId: string;
  let secondRoutineId: string;

  const name = `E2E unique ${stamp}`;
  const register = async (agent: Agent, n: number) => {
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-unique-${n}-${stamp}@test.local`,
        username: `e2eunique${n}${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    userIds.push((res.body as { id: string }).id);
  };
  const createRoutine = (agent: Agent, routineName: string) =>
    agent.post('/routines').send({
      name: routineName,
      items: [{ exerciseId, position: 0, blocks: [] }],
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

    owner = request.agent(app.getHttpServer());
    other = request.agent(app.getHttpServer());
    await register(owner, 1);
    await register(other, 2);

    exerciseId = (
      await prisma.exercise.findFirstOrThrow({ where: { createdById: null } })
    ).id;
    await createRoutine(owner, name).expect(201);
    secondRoutineId = (await createRoutine(owner, `${name} B`).expect(201)).body
      .id;
  });

  afterAll(async () => {
    await prisma.routineItem.deleteMany({
      where: { routine: { userId: { in: userIds } } },
    });
    await prisma.routine.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.program.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  it('rejects creating a routine with a name you already use', async () => {
    await createRoutine(owner, name).expect(409);
  });

  it('rejects renaming a routine to a name you already use', async () => {
    await owner
      .patch(`/routines/${secondRoutineId}`)
      .send({ name })
      .expect(409);
    const kept = await prisma.routine.findUniqueOrThrow({
      where: { id: secondRoutineId },
    });
    expect(kept.name).toBe(`${name} B`);
  });

  it('lets another user use the same routine name', async () => {
    await createRoutine(other, name).expect(201);
  });

  it('rejects creating a program with a name you already use', async () => {
    await owner.post('/programs').send({ name, routineIds: [] }).expect(201);
    await owner.post('/programs').send({ name, routineIds: [] }).expect(409);
  });
});
