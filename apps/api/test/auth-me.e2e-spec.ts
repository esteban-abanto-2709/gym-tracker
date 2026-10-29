import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();

describe('AuthController /auth/me (e2e)', () => {
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
        email: `e2e-me-${stamp}@test.local`,
        username: `e2eme${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    userId = registered.body.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  it('starts with no news opened or seen', async () => {
    const res = await agent.get('/auth/me').expect(200);
    expect(res.body.newsOpened).toEqual([]);
    expect(res.body.newsSeen).toEqual([]);
  });

  it('stores news ids without duplicates and keeps the other field', async () => {
    await agent
      .patch('/auth/me')
      .send({ newsOpened: ['programs', 'tiktok', 'programs'] })
      .expect(200);
    await agent
      .patch('/auth/me')
      .send({ newsSeen: ['tiktok'] })
      .expect(200);

    const res = await agent.get('/auth/me').expect(200);
    expect(res.body.newsOpened).toEqual(['programs', 'tiktok']);
    expect(res.body.newsSeen).toEqual(['tiktok']);
  });

  it('starts on the system theme and stores the chosen one', async () => {
    const before = await agent.get('/auth/me').expect(200);
    expect(before.body.theme).toBe('system');

    await agent.patch('/auth/me').send({ theme: 'light' }).expect(200);

    const after = await agent.get('/auth/me').expect(200);
    expect(after.body.theme).toBe('light');
  });

  it('creates the account in English when the sign-up sends no language', async () => {
    const res = await agent.get('/auth/me').expect(200);
    expect(res.body.interfaceLocale).toBe('en');
    expect(res.body.exerciseLocale).toBe('en');
  });

  it('creates the account in the language the device signed up with', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `e2e-me-es-${stamp}@test.local`,
        username: `e2emees${stamp}`,
        password: 'e2e-password',
        locale: 'es',
      })
      .expect(201);
    try {
      expect(res.body.interfaceLocale).toBe('es');
      expect(res.body.exerciseLocale).toBe('es');
    } finally {
      await prisma.user.delete({ where: { id: res.body.id } });
    }
  });

  it('rejects an unknown sign-up language', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `e2e-me-fr-${stamp}@test.local`,
        username: `e2emefr${stamp}`,
        password: 'e2e-password',
        locale: 'fr',
      })
      .expect(400);
  });

  it('keeps the interface language apart from the exercise language', async () => {
    const before = await agent.get('/auth/me').expect(200);

    await agent.patch('/auth/me').send({ interfaceLocale: 'es' }).expect(200);

    const after = await agent.get('/auth/me').expect(200);
    expect(after.body.interfaceLocale).toBe('es');
    expect(after.body.exerciseLocale).toBe(before.body.exerciseLocale);
  });

  it('always keeps an interface language: it cannot be cleared', async () => {
    await agent.patch('/auth/me').send({ interfaceLocale: null }).expect(400);
  });

  it('rejects an unknown interface language', async () => {
    await agent.patch('/auth/me').send({ interfaceLocale: 'fr' }).expect(400);
  });

  it('rejects an unknown theme', async () => {
    await agent.patch('/auth/me').send({ theme: 'dracula' }).expect(400);
  });

  it('rejects ids that are not short strings', async () => {
    await agent
      .patch('/auth/me')
      .send({ newsSeen: [42] })
      .expect(400);
    await agent
      .patch('/auth/me')
      .send({ newsSeen: ['x'.repeat(65)] })
      .expect(400);
  });
});
