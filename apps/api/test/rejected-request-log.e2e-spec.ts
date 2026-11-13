import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();

describe('Rejected request log (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let agent: ReturnType<typeof request.agent>;
  let userId: string;
  let exerciseId: string;

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
        email: `e2e-reject-${stamp}@test.local`,
        username: `e2ereject${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    userId = (res.body as { id: string }).id;
    exerciseId = (
      await prisma.exercise.findFirstOrThrow({ where: { createdById: null } })
    ).id;
  });

  afterAll(async () => {
    await prisma.workout.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('answers 400 as before and logs the rejected set', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    const res = await agent
      .post('/workouts')
      .send({ exerciseId, reps: 0, weight: 20 })
      .expect(400);

    expect((res.body as { message: string[] }).message).toEqual([
      'reps must be a positive number',
    ]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('POST /workouts 400'),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('reps must be a positive number'),
    );
    warn.mockRestore();
  });
});
