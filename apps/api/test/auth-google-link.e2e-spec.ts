import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { OAuth2Client } from 'google-auth-library';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const email = `e2e-google-${stamp}@test.local`;
const password = 'e2e-password';

describe('AuthController google linking (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userId: string;
  let squatterCookie: string;

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

    const googleClient: OAuth2Client = app.get(AuthService)['googleClient'];
    jest.spyOn(googleClient, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        sub: `google-${stamp}`,
        email,
        email_verified: true,
        name: 'Google Owner',
      }),
    } as never);

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username: `e2egoogle${stamp}`, password })
      .expect(201);
    userId = res.body.id;
    squatterCookie = res.get('Set-Cookie')![0].split(';')[0];
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  it('gives the account to the Google owner and locks out the password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/google')
      .send({ credential: 'fake' })
      .expect(201);
    expect(res.body.id).toBe(userId);
    expect(res.body.hasPassword).toBe(false);
    const ownerCookie = res.get('Set-Cookie')![0].split(';')[0];

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', ownerCookie)
      .expect(200);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', squatterCookie)
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(401);
  });

  it('keeps the session when an already linked account logs in again', async () => {
    const first = await request(app.getHttpServer())
      .post('/auth/google')
      .send({ credential: 'fake' })
      .expect(201);
    const firstCookie = first.get('Set-Cookie')![0].split(';')[0];

    await request(app.getHttpServer())
      .post('/auth/google')
      .send({ credential: 'fake' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', firstCookie)
      .expect(200);
  });
});
