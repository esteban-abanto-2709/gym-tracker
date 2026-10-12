import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const EXERCISE = `Test Exercise E2E ${stamp}`;

describe('ExercisesController (e2e)', () => {
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
    const registered = await agent
      .post('/auth/register')
      .send({
        email: `e2e-exercises-${stamp}@test.local`,
        username: `e2eex${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    userId = registered.body.id;
  });

  afterAll(async () => {
    await prisma.exercise.deleteMany({ where: { createdById: userId } });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  it('/exercises (GET) sin sesion responde 401', () => {
    return request(app.getHttpServer()).get('/exercises').expect(401);
  });

  it('/exercises (GET)', () => {
    return agent
      .get('/exercises')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/exercises (POST)', () => {
    return agent
      .post('/exercises')
      .send({ name: EXERCISE })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual(EXERCISE);
        expect(res.body.slug).toBeTruthy();
        expect(res.body.createdById).toEqual(userId);
        expect(res.body.primaryMuscles).toEqual([]);
        expect(res.body.mechanic).toBeNull();
      });
  });

  it('/exercises (POST) with muscles and mechanic', () => {
    return agent
      .post('/exercises')
      .send({
        name: `${EXERCISE} completo`,
        primaryMuscles: ['CHEST'],
        secondaryMuscles: ['TRICEPS', 'FRONT_DELTS'],
        mechanic: 'COMPOUND',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.primaryMuscles).toEqual(['CHEST']);
        expect(res.body.secondaryMuscles).toEqual(['TRICEPS', 'FRONT_DELTS']);
        expect(res.body.mechanic).toEqual('COMPOUND');
      });
  });

  it('/exercises (POST) rejects a muscle outside the list', () => {
    return agent
      .post('/exercises')
      .send({ name: `${EXERCISE} malo`, primaryMuscles: ['SHOULDERS'] })
      .expect(400);
  });

  it('/exercises (POST) returns the official exercise when the name matches', async () => {
    const official = await prisma.exercise.create({
      data: { name: `Official E2E ${stamp}`, slug: `e2e-official-${stamp}` },
    });
    try {
      const res = await agent
        .post('/exercises')
        .send({ name: `official e2e ${stamp}` })
        .expect(201);
      expect(res.body.id).toEqual(official.id);
    } finally {
      await prisma.exercise.delete({ where: { id: official.id } });
    }
  });

  it('/exercises (GET) lists official exercises first', async () => {
    const res = await agent.get('/exercises').expect(200);
    const official = res.body.map(
      (e: { createdById: string | null }) => e.createdById === null,
    );
    expect(official).toEqual([...official].sort((a, b) => +b - +a));
  });
});
