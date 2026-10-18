import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const email = `e2e-email-${stamp}@test.local`;
const password = 'e2e-password';

describe('AuthController email case (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
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
  });

  afterAll(async () => {
    if (userId) await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  it('stores the email lowercased and trimmed', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `  E2E-Email-${stamp}@Test.Local `,
        username: `e2eemail${stamp}`,
        password,
      })
      .expect(201);
    userId = res.body.id;
    expect(res.body.email).toBe(email);
    expect(res.body.hasPassword).toBe(true);
  });

  it('logs in whatever the case of the email', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: email.toUpperCase(), password })
      .expect(201);
  });

  it('rejects a second account that only differs in case', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: email.toUpperCase(),
        username: `e2eemail2${stamp}`,
        password,
      })
      .expect(409);
  });
});
