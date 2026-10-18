import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const email = `e2e-sessions-${stamp}@test.local`;
const password = 'e2e-password';

describe('AuthController sessions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userId: string;
  let firstCookie: string;

  const me = (cookie: string) =>
    request(app.getHttpServer()).get('/auth/me').set('Cookie', cookie);
  const logout = (cookie?: string) => {
    const req = request(app.getHttpServer()).post('/auth/logout');
    return cookie ? req.set('Cookie', cookie) : req;
  };
  const login = async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    return res.get('Set-Cookie')![0].split(';')[0];
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

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username: `e2esessions${stamp}`, password })
      .expect(201);
    userId = res.body.id;
    firstCookie = res.get('Set-Cookie')![0].split(';')[0];
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  it('keeps tokens signed before versions existed valid', async () => {
    const legacy = app.get(JwtService).sign({ sub: userId });
    await me(`token=${legacy}`).expect(200);
  });

  it('logging out closes every session of the user', async () => {
    const otherDevice = await login();
    await me(firstCookie).expect(200);
    await me(otherDevice).expect(200);

    await logout(firstCookie).expect(201);

    await me(firstCookie).expect(401);
    await me(otherDevice).expect(401);
  });

  it('logs out a revoked or missing session without revoking again', async () => {
    const fresh = await login();
    await logout(firstCookie).expect(201);
    await logout().expect(201);
    await me(fresh).expect(200);
  });
});
