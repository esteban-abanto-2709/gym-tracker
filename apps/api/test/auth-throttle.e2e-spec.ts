import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

const attempt = (app: INestApplication<App>, ip: string) =>
  request(app.getHttpServer())
    .post('/auth/login')
    .set('cf-connecting-ip', ip)
    .send({ email: 'nobody@test.local', password: 'wrong-password' });

describe('AuthController login throttling (e2e)', () => {
  let app: INestApplication<App>;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('blocks the sixth attempt in a minute from the same client', async () => {
    for (let i = 0; i < 5; i++) {
      await attempt(app, '203.0.113.1').expect(401);
    }
    const res = await attempt(app, '203.0.113.1').expect(429);
    expect(res.body.message).toMatch(/Demasiados intentos/);
  });

  it('counts each client on its own', async () => {
    await attempt(app, '203.0.113.2').expect(401);
  });
});
