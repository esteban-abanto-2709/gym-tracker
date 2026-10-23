import { randomUUID } from 'node:crypto';
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

describe('Blocks and sets (e2e)', () => {
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
    await prisma.exercise.delete({ where: { id: exerciseId } });
    await prisma.user.delete({ where: { id: userId } });
    await app.close();
  });

  describe('routines with blocks', () => {
    it('saves the four kinds and returns them normalized', async () => {
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

      expect(
        created.body.items.map((i: { blocks: unknown[] }) => i.blocks),
      ).toEqual([
        [
          { kind: 'warmup', sets: 1, reps: 25 },
          { kind: 'weight_reps', sets: 3, reps: 8, repsMax: null },
        ],
        [{ kind: 'reps', sets: 2, reps: null, repsMax: null }],
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
          { kind: 'weight_reps', sets: 3, reps: 8, repsMax: null },
        ],
      ]);
    });

    it('returns the same blocks when read again', async () => {
      const read = await agent.get(`/routines/${routineId}`).expect(200);
      expect(read.body.items[0].blocks[0]).toEqual({
        kind: 'warmup',
        sets: 1,
        reps: 25,
      });
      expect(read.body.items[3].blocks).toEqual([]);
      expect(read.body.items[4].blocks[0].steps).toHaveLength(3);
    });

    it('updates the kind of a block', async () => {
      const updated = await agent
        .patch(`/routines/${routineId}`)
        .send({
          items: [
            {
              exerciseId,
              position: 0,
              blocks: [{ kind: 'warmup', sets: 4, reps: 6 }],
            },
          ],
        })
        .expect(200);

      expect(updated.body.items).toHaveLength(1);
      expect(updated.body.items[0].blocks).toEqual([
        { kind: 'warmup', sets: 4, reps: 6 },
      ]);
    });

    it.each([
      ['legacy kind', [{ kind: 'legacy', sets: 3, reps: 8 }]],
      ['unknown kind', [{ kind: 'superset', sets: 3 }]],
      ['ramp without steps', [{ kind: 'ramp', steps: [] }]],
      ['ramp with plain sets', [{ kind: 'ramp', sets: 3 }]],
      [
        'field foreign to the kind',
        [{ kind: 'reps', sets: 2, durationSec: 30 }],
      ],
      ['invalid target', [{ kind: 'time', sets: 0, durationSec: 30 }]],
      ['no block list', undefined],
    ])('rejects %s with 400', async (_label, blocks) => {
      await agent
        .post('/routines')
        .send({
          name: `E2E invalid ${stamp}`,
          items: [{ exerciseId, position: 0, blocks }],
        })
        .expect(400);
    });
  });

  describe('sets', () => {
    it('logs a weighted set, a reps-only set and a timed set', async () => {
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

    it('logs a warmup with its type', async () => {
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

    it('logs a ramp step with its number', async () => {
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

    it('rejects a non-positive step', async () => {
      await agent
        .post('/workouts')
        .send({ exerciseId, reps: 10, weight: 30, setType: 'RAMP', step: 0 })
        .expect(400);
    });

    it('rejects weight and duration in the same set', async () => {
      await agent
        .post('/workouts')
        .send({ exerciseId, reps: 1, weight: 10, durationSec: 30 })
        .expect(400);
    });

    it('allows removing the weight from an existing set', async () => {
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

    it('with the same clientId saves once and returns the same set', async () => {
      const clientId = randomUUID();
      const set = { exerciseId, reps: 8, weight: 40, clientId };

      const [a, b] = await Promise.all([
        agent.post('/workouts').send(set).expect(201),
        agent.post('/workouts').send(set).expect(201),
      ]);
      const c = await agent.post('/workouts').send(set).expect(201);

      expect(b.body.id).toBe(a.body.id);
      expect(c.body.id).toBe(a.body.id);
      expect(await prisma.workout.count({ where: { userId, clientId } })).toBe(
        1,
      );
    });

    it('without clientId each request is a new set', async () => {
      const set = { exerciseId, reps: 6, weight: 30 };
      const a = await agent.post('/workouts').send(set).expect(201);
      const b = await agent.post('/workouts').send(set).expect(201);

      expect(b.body.id).not.toBe(a.body.id);
    });

    it('rejects a clientId that is not a uuid', async () => {
      await agent
        .post('/workouts')
        .send({ exerciseId, reps: 5, clientId: 'abc' })
        .expect(400);
    });
  });

  describe('recommendation', () => {
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
            reps: 10,
            weight: 30,
            opinion: '',
            equipmentId: 'barra',
            setType: 'RAMP',
            step: 1,
            createdAt: at(1),
          },
          {
            userId,
            exerciseId,
            reps: 5,
            weight: 45,
            opinion: '',
            equipmentId: 'barra',
            setType: 'RAMP',
            step: 2,
            createdAt: at(2),
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

    it('by default uses only working sets with the same equipment', async () => {
      const res = await rec('&equipmentId=barra').expect(200);
      expect(res.body).toMatchObject({ lastWeight: 60, lastReps: 8 });
    });

    it('with setType=WARMUP uses only warmups', async () => {
      const res = await rec('&equipmentId=barra&setType=WARMUP').expect(200);
      expect(res.body).toMatchObject({ lastWeight: 20, lastReps: 25 });
    });

    it.each([
      [1, 30, 10],
      [2, 45, 5],
    ])(
      'each ramp step remembers its own weight (%i)',
      async (step, weight, reps) => {
        const res = await rec(
          `&equipmentId=barra&setType=RAMP&step=${step}`,
        ).expect(200);
        expect(res.body).toMatchObject({ lastWeight: weight, lastReps: reps });
      },
    );

    it('the ramp returns the working weight as reference', async () => {
      const res = await rec('&equipmentId=barra&setType=RAMP&step=1').expect(
        200,
      );
      expect(res.body.workingWeight).toBe(60);
    });

    it('a step without history does not make up a weight', async () => {
      const res = await rec('&equipmentId=barra&setType=RAMP&step=3').expect(
        200,
      );
      expect(res.body).toMatchObject({ lastWeight: null, workingWeight: 60 });
    });

    it('lastMeasure comes from the last set of the exercise, unfiltered', async () => {
      const res = await rec('&equipmentId=barra').expect(200);
      expect(res.body.lastMeasure).toBe('reps');
    });

    it('without history for the filter returns nulls but keeps lastMeasure', async () => {
      const res = await rec('&equipmentId=mancuernas').expect(200);
      expect(res.body).toMatchObject({
        lastWeight: null,
        lastReps: null,
        lastMeasure: 'reps',
      });
    });

    it('rejects a step that is not a number', async () => {
      await rec('&setType=RAMP&step=uno').expect(400);
    });

    it('rejects an unknown setType', async () => {
      await rec('&setType=COOLDOWN').expect(400);
    });
  });

  it('responds 401 without a session', async () => {
    await request(app.getHttpServer()).get('/routines').expect(401);
  });
});
