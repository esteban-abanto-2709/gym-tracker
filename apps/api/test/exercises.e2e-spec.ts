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
    await prisma.exercise.deleteMany({ where: { name: EXERCISE } });
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
      });
  });
});
