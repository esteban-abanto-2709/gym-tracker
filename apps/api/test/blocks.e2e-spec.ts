import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const EMAIL = `e2e-${stamp}@test.local`;
const PASSWORD = 'e2e-password';
const EXERCISE = `E2E Bloques ${stamp}`;

describe('Bloques y sets (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let agent: ReturnType<typeof request.agent>;
  let exerciseId: string;
  let userId: string;
  let routineId: string;

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
      .send({ email: EMAIL, username: `e2e${stamp}`, password: PASSWORD })
      .expect(201);
    userId = registered.body.id;

    const exercise = await agent
      .post('/exercises')
      .send({ name: EXERCISE })
      .expect(201);
    exerciseId = exercise.body.id;
  });

  afterAll(async () => {
    await prisma.workout.deleteMany({ where: { userId } });
    await prisma.routineItem.deleteMany({ where: { routine: { userId } } });
    await prisma.routine.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.exercise.delete({ where: { id: exerciseId } });
    await app.close();
  });

  describe('rutinas con bloques', () => {
    it('guarda los cuatro tipos y los devuelve normalizados', async () => {
      const created = await agent
        .post('/routines')
        .send({
          name: `E2E ${stamp}`,
          items: [
            {
              exerciseId,
              position: 0,
              blocks: [
                { kind: 'warmup', sets: 1, reps: 25 },
                { kind: 'weight_reps', sets: 3, reps: 8 },
              ],
            },
            { exerciseId, position: 1, blocks: [{ kind: 'reps', sets: 2 }] },
            {
              exerciseId,
              position: 2,
              blocks: [{ kind: 'time', sets: 2, durationSec: 30 }],
            },
            { exerciseId, position: 3, blocks: [] },
            {
              exerciseId,
              position: 4,
              blocks: [
                {
                  kind: 'ramp',
                  steps: [
                    { reps: 10, pct: 50 },
                    { reps: 5, pct: 70 },
                    { reps: 3 },
                  ],
                },
                { kind: 'weight_reps', sets: 3, reps: 8 },
              ],
            },
          ],
        })
        .expect(201);
      routineId = created.body.id;

      expect(created.body.items.map((i: { blocks: unknown[] }) => i.blocks))
        .toEqual([
          [
            { kind: 'warmup', sets: 1, reps: 25 },
            { kind: 'weight_reps', sets: 3, reps: 8, approx: false },
          ],
          [{ kind: 'reps', sets: 2, reps: null }],
          [{ kind: 'time', sets: 2, durationSec: 30 }],
          [],
          [
            {
              kind: 'ramp',
              steps: [
                { reps: 10, pct: 50 },
                { reps: 5, pct: 70 },
                { reps: 3, pct: null },
              ],
            },
            { kind: 'weight_reps', sets: 3, reps: 8, approx: false },
          ],
        ]);
    });

    it('devuelve los mismos bloques al releerla', async () => {
      const read = await agent.get(`/routines/${routineId}`).expect(200);
      expect(read.body.items[0].blocks[0]).toEqual({
        kind: 'warmup',
        sets: 1,
        reps: 25,
      });
      expect(read.body.items[3].blocks).toEqual([]);
      expect(read.body.items[4].blocks[0].steps).toHaveLength(3);
    });

    it('actualiza el tipo de un bloque', async () => {
      const updated = await agent
        .patch(`/routines/${routineId}`)
        .send({
          items: [
            {
              exerciseId,
              position: 0,
              blocks: [{ kind: 'weight_reps', sets: 4, reps: 6, approx: true }],
            },
          ],
        })
        .expect(200);

      expect(updated.body.items).toHaveLength(1);
      expect(updated.body.items[0].blocks).toEqual([
        { kind: 'weight_reps', sets: 4, reps: 6, approx: true },
      ]);
    });

    it.each([
      ['tipo legacy', [{ kind: 'legacy', sets: 3, reps: 8 }]],
      ['tipo desconocido', [{ kind: 'superset', sets: 3 }]],
      ['rampa sin escalones', [{ kind: 'ramp', steps: [] }]],
      ['rampa con series sueltas', [{ kind: 'ramp', sets: 3 }]],
      ['campo ajeno al tipo', [{ kind: 'reps', sets: 2, durationSec: 30 }]],
      ['meta invalida', [{ kind: 'time', sets: 0, durationSec: 30 }]],
      ['sin lista de bloques', undefined],
    ])('rechaza %s con 400', async (_label, blocks) => {
      await agent
        .post('/routines')
        .send({
          name: `E2E invalida ${stamp}`,
          items: [{ exerciseId, position: 0, blocks }],
        })
        .expect(400);
    });
  });

  describe('sets', () => {
    it('registra un set con peso, uno de solo reps y uno de tiempo', async () => {
      const weightSet = await agent
        .post('/workouts')
        .send({ exerciseId, reps: 8, weight: 60, equipmentId: 'barra' })
        .expect(201);
      expect(weightSet.body).toMatchObject({
        weight: 60,
        reps: 8,
        durationSec: null,
        setType: 'WORKING',
      });

      const repsSet = await agent
        .post('/workouts')
        .send({ exerciseId, reps: 15 })
        .expect(201);
      expect(repsSet.body).toMatchObject({ weight: null, durationSec: null });

      const timeSet = await agent
        .post('/workouts')
        .send({ exerciseId, reps: 1, durationSec: 45 })
        .expect(201);
      expect(timeSet.body).toMatchObject({ weight: null, durationSec: 45 });
    });

    it('registra un calentamiento con su tipo', async () => {
      const warmup = await agent
        .post('/workouts')
        .send({
          exerciseId,
          reps: 25,
          weight: 20,
          equipmentId: 'barra',
          setType: 'WARMUP',
        })
        .expect(201);
      expect(warmup.body.setType).toBe('WARMUP');
    });

    it('registra un escalon de rampa con su numero', async () => {
      const ramp = await agent
        .post('/workouts')
        .send({
          exerciseId,
          reps: 10,
          weight: 30,
          equipmentId: 'barra',
          setType: 'RAMP',
          step: 1,
        })
        .expect(201);
      expect(ramp.body).toMatchObject({ setType: 'RAMP', step: 1 });
    });

    it('rechaza un escalon que no sea positivo', async () => {
      await agent
        .post('/workouts')
        .send({ exerciseId, reps: 10, weight: 30, setType: 'RAMP', step: 0 })
        .expect(400);
    });

    it('rechaza peso y duracion en el mismo set', async () => {
      await agent
        .post('/workouts')
        .send({ exerciseId, reps: 1, weight: 10, durationSec: 30 })
        .expect(400);
    });

    it('permite quitarle el peso a un set existente', async () => {
      const created = await agent
        .post('/workouts')
        .send({ exerciseId, reps: 10, weight: 5 })
        .expect(201);

      const updated = await agent
        .patch(`/workouts/${created.body.id}`)
        .send({ reps: 12, weight: null })
        .expect(200);

      expect(updated.body).toMatchObject({ weight: null, reps: 12 });
    });
  });

  describe('recomendacion', () => {
    beforeAll(async () => {
      await prisma.workout.deleteMany({ where: { userId } });
      const base = new Date('2026-09-10T10:00:00.000Z');
      const at = (minutes: number) =>
        new Date(base.getTime() + minutes * 60_000);
      await prisma.workout.createMany({
        data: [
          {
            userId,
            exerciseId,
            reps: 25,
            weight: 20,
            opinion: '',
            equipmentId: 'barra',
            setType: 'WARMUP',
            createdAt: at(0),
          },
          {
            userId,
            exerciseId,
            reps: 8,
            weight: 60,
            opinion: '',
            equipmentId: 'barra',
            setType: 'WORKING',
            createdAt: at(5),
          },
          {
            userId,
            exerciseId,
            reps: 15,
            weight: null,
            opinion: '',
            setType: 'WORKING',
            createdAt: at(10),
          },
        ],
      });
    });

    const rec = (query: string) =>
      agent.get(`/workouts/recommendation?exerciseId=${exerciseId}${query}`);

    it('por defecto usa solo series efectivas del mismo equipo', async () => {
      const res = await rec('&isApproximation=false&equipmentId=barra').expect(
        200,
      );
      expect(res.body).toMatchObject({ lastWeight: 60, lastReps: 8 });
    });

    it('con setType=WARMUP usa solo calentamientos', async () => {
      const res = await rec(
        '&isApproximation=false&equipmentId=barra&setType=WARMUP',
      ).expect(200);
      expect(res.body).toMatchObject({ lastWeight: 20, lastReps: 25 });
    });

    it('lastMeasure sale del ultimo set del ejercicio, sin filtros', async () => {
      const res = await rec('&isApproximation=false&equipmentId=barra').expect(
        200,
      );
      expect(res.body.lastMeasure).toBe('reps');
    });

    it('sin historial del filtro devuelve nulos pero conserva lastMeasure', async () => {
      const res = await rec(
        '&isApproximation=true&equipmentId=barra',
      ).expect(200);
      expect(res.body).toMatchObject({
        lastWeight: null,
        lastReps: null,
        suggestedWeight: null,
        lastMeasure: 'reps',
      });
    });

    it('rechaza un setType desconocido', async () => {
      await rec('&setType=COOLDOWN').expect(400);
    });
  });

  it('sin sesion responde 401', async () => {
    await request(app.getHttpServer()).get('/routines').expect(401);
  });
});
