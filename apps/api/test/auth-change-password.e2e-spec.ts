import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const email = `e2e-change-${stamp}@test.local`;
const oldPassword = 'old-password';
const newPassword = 'new-password';

const cookieOf = (res: request.Response) =>
  res.get('Set-Cookie')![0].split(';')[0];

describe('AuthController PATCH /auth/password (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userId: string;
  let googleOnlyId: string;

  let client = 0;
  const login = (password: string) =>
    request(app.getHttpServer())
      .post('/auth/login')
      .set('cf-connecting-ip', `192.0.2.${++client}`)
      .send({ email, password });
  const change = (cookie: string, body: object) =>
    request(app.getHttpServer())
      .patch('/auth/password')
      .set('Cookie', cookie)
      .send(body);
  const me = (cookie: string) =>
    request(app.getHttpServer()).get('/auth/me').set('Cookie', cookie);

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

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username: `e2echange${stamp}`, password: oldPassword })
      .expect(201);
    userId = (res.body as { id: string }).id;

    googleOnlyId = (
      await prisma.user.create({
        data: {
          email: `e2e-change-google-${stamp}@test.local`,
          username: 'e2e change google',
          slug: `e2e-change-google-${stamp}`,
          googleId: `change-google-${stamp}`,
        },
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userId, googleOnlyId] } },
    });
    await app.close();
  });

  it('refuses a wrong current password or a short new one', async () => {
    const cookie = cookieOf(await login(oldPassword).expect(201));
    await change(cookie, {
      currentPassword: 'not-it',
      newPassword,
    }).expect(403);
    await change(cookie, {
      currentPassword: oldPassword,
      newPassword: 'short',
    }).expect(400);
    await login(oldPassword).expect(201);
  });

  it('changes it, keeps this device in and logs out the others', async () => {
    const thisDevice = cookieOf(await login(oldPassword).expect(201));
    const otherDevice = cookieOf(await login(oldPassword).expect(201));

    const res = await change(thisDevice, {
      currentPassword: oldPassword,
      newPassword,
    }).expect(200);

    await me(cookieOf(res)).expect(200);
    await me(thisDevice).expect(401);
    await me(otherDevice).expect(401);
    await login(oldPassword).expect(401);
    await login(newPassword).expect(201);
  });

  it('rejects an account without a password', async () => {
    const token = app.get(JwtService).sign({ sub: googleOnlyId, ver: 0 });
    await change(`token=${token}`, {
      currentPassword: 'anything',
      newPassword,
    }).expect(400);
  });
});
