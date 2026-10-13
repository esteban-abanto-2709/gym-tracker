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
      data: {
        slug: `e2e-official-${stamp}`,
        names: {
          create: {
            locale: 'en',
            name: `Official E2E ${stamp}`,
            searchName: `official e2e ${stamp}`,
          },
        },
      },
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

  describe('stores the new name in the user exercise language', () => {
    const localeOf = async (exerciseId: string) =>
      (await prisma.exerciseName.findMany({ where: { exerciseId } })).map(
        (n) => [n.locale, n.searchName],
      );
    const setLanguage = (exerciseLocale: 'es' | 'en') =>
      prisma.user.update({ where: { id: userId }, data: { exerciseLocale } });

    it('uses English by default, whatever the device language', async () => {
      const res = await agent
        .post('/exercises')
        .set('Accept-Language', 'es-PE,es;q=0.9')
        .send({ name: `Rowing ${stamp}` })
        .expect(201);
      expect(await localeOf((res.body as { id: string }).id)).toEqual([
        ['en', `rowing ${stamp}`],
      ]);
    });

    it('uses Spanish when the user chose it', async () => {
      await setLanguage('es');
      try {
        const res = await agent
          .post('/exercises')
          .send({ name: `Remo Ráro ${stamp}` })
          .expect(201);
        expect(await localeOf((res.body as { id: string }).id)).toEqual([
          ['es', `remo raro ${stamp}`],
        ]);
      } finally {
        await setLanguage('en');
      }
    });
  });

  it('/exercises (GET) lists official exercises first', async () => {
    const res = await agent.get('/exercises').expect(200);
    const official = res.body.map(
      (e: { createdById: string | null }) => e.createdById === null,
    );
    expect(official).toEqual([...official].sort((a, b) => +b - +a));
  });

  describe('names in the user language', () => {
    let officialId: string;
    const en = `Bench E2E ${stamp}`;
    const es = `Press Banca E2E ${stamp}`;
    const nameOf = (list: { id: string; name: string }[]) =>
      list.find((e) => e.id === officialId)?.name;

    beforeAll(async () => {
      officialId = (
        await prisma.exercise.create({
          data: {
            slug: `e2e-bench-${stamp}`,
            names: {
              create: [
                { locale: 'en', name: en, searchName: en.toLowerCase() },
                {
                  locale: 'es',
                  name: es,
                  searchName: es.toLowerCase(),
                },
              ],
            },
          },
        })
      ).id;
    });

    afterAll(async () => {
      await prisma.workout.deleteMany({ where: { userId } });
      await prisma.routine.deleteMany({ where: { userId } });
      await prisma.user.update({
        where: { id: userId },
        data: { exerciseLocale: 'en' },
      });
      await prisma.exercise.delete({ where: { id: officialId } });
    });

    it('lists English by default, ignoring the device, with both names for search', async () => {
      const res = await agent
        .get('/exercises')
        .set('Accept-Language', 'es-PE')
        .expect(200);
      const official = (
        res.body as { id: string; name: string; searchNames: string[] }[]
      ).find((e) => e.id === officialId);
      expect(official?.name).toBe(en);
      expect(official?.searchNames.sort()).toEqual(
        [en.toLowerCase(), es.toLowerCase()].sort(),
      );
      expect(official).not.toHaveProperty('names');
    });

    it('creating with the name in another language returns the official', async () => {
      const res = await agent
        .post('/exercises')
        .send({ name: es.toUpperCase() })
        .expect(201);
      expect((res.body as { id: string; name: string }).id).toBe(officialId);
      expect((res.body as { name: string }).name).toBe(en);
    });

    it('localizes names inside routines and sets', async () => {
      await agent.patch('/auth/me').send({ exerciseLocale: 'es' }).expect(200);
      await agent
        .post('/routines')
        .send({
          name: `E2E names ${stamp}`,
          items: [{ exerciseId: officialId, position: 0, blocks: [] }],
        })
        .expect(201);
      await agent
        .post('/workouts')
        .send({ exerciseId: officialId, reps: 5 })
        .expect(201);

      const routines = await agent.get('/routines').expect(200);
      const items = (
        routines.body as {
          items: { exercise: { id: string; name: string } }[];
        }[]
      ).flatMap((r) => r.items.map((i) => i.exercise));
      expect(nameOf(items)).toBe(es);

      const day = (offset: number) =>
        new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
      const sets = await agent
        .get(`/workouts?from=${day(-1)}&to=${day(1)}`)
        .expect(200);
      expect(
        nameOf(
          (sets.body as { exercise: { id: string; name: string } }[]).map(
            (w) => w.exercise,
          ),
        ),
      ).toBe(es);

      await agent.patch('/auth/me').send({ exerciseLocale: 'en' }).expect(200);
    });

    it('saves the exercise language from the profile', async () => {
      const me = await agent
        .patch('/auth/me')
        .send({ exerciseLocale: 'es' })
        .expect(200);
      expect((me.body as { exerciseLocale: string }).exerciseLocale).toBe('es');

      const res = await agent
        .get('/exercises')
        .set('Accept-Language', 'en-US')
        .expect(200);
      expect(nameOf(res.body as { id: string; name: string }[])).toBe(es);

      await agent.patch('/auth/me').send({ exerciseLocale: 'en' }).expect(200);
    });

    it('rejects an unsupported or empty language', async () => {
      await agent.patch('/auth/me').send({ exerciseLocale: 'fr' }).expect(400);
      await agent.patch('/auth/me').send({ exerciseLocale: null }).expect(400);
    });
  });
});
