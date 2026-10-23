import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
const password = 'e2e-password';
type Agent = ReturnType<typeof request.agent>;

type PublishedItem = { exerciseId: string; position: number; blocks: unknown };
type Published = {
  id: string;
  kind: string;
  slug: string;
  name: string;
  description: string | null;
  routines: { name: string; position: number; items: PublishedItem[] }[];
};

describe('Publications (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let author: Agent;
  let intruder: Agent;
  const userIds: string[] = [];
  let exerciseIds: string[];
  let routineId: string;
  let otherRoutineId: string;
  let programId: string;
  let publication: Published;

  let client = 0;
  const register = async (agent: Agent, name: string) => {
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-pub-${name}-${stamp}@test.local`,
        username: `e2epub${name}${stamp}`,
        password,
      })
      .expect(201);
    const id = (res.body as { id: string }).id;
    userIds.push(id);
    return id;
  };
  const publish = (
    agent: Agent,
    kind: 'routines' | 'programs',
    id: string,
    body: object,
  ) =>
    agent
      .post(`/${kind}/${id}/publish`)
      .set('cf-connecting-ip', `198.51.100.${++client}`)
      .send(body);
  const slug = (name: string) => `e2e-${name}-${stamp}`;
  const blocks = [{ kind: 'weight_reps', sets: 3, reps: 8, repsMax: 10 }];

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

    author = request.agent(app.getHttpServer());
    intruder = request.agent(app.getHttpServer());
    await register(author, 'author');
    await register(intruder, 'intruder');

    exerciseIds = (
      await prisma.exercise.findMany({
        where: { createdById: null },
        take: 3,
        orderBy: { slug: 'asc' },
      })
    ).map((e) => e.id);

    routineId = (
      await author
        .post('/routines')
        .send({
          name: `E2E pub A ${stamp}`,
          items: [
            { exerciseId: exerciseIds[0], position: 0, blocks },
            { exerciseId: exerciseIds[1], position: 1, blocks },
          ],
        })
        .expect(201)
    ).body.id;
    otherRoutineId = (
      await author
        .post('/routines')
        .send({
          name: `E2E pub B ${stamp}`,
          items: [{ exerciseId: exerciseIds[2], position: 0, blocks }],
        })
        .expect(201)
    ).body.id;
    programId = (
      await author
        .post('/programs')
        .send({
          name: `E2E pub program ${stamp}`,
          routineIds: [otherRoutineId, routineId],
        })
        .expect(201)
    ).body.id;
  });

  afterAll(async () => {
    await prisma.publication.deleteMany({
      where: { authorId: { in: userIds } },
    });
    await prisma.routineItem.deleteMany({
      where: { routine: { userId: { in: userIds } } },
    });
    await prisma.routine.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.program.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  it('publishes a routine as a snapshot of its exercises', async () => {
    const res = await publish(author, 'routines', routineId, {
      slug: slug('back'),
      description: '  Heavy back  ',
    }).expect(201);
    publication = res.body as Published;

    expect(publication.kind).toBe('ROUTINE');
    expect(publication.slug).toBe(slug('back'));
    expect(publication.name).toBe(`E2E pub A ${stamp}`);
    expect(publication.description).toBe('Heavy back');
    expect(publication.routines).toHaveLength(1);
    expect(
      publication.routines[0].items.map((i) => [i.exerciseId, i.blocks]),
    ).toEqual([
      [exerciseIds[0], blocks],
      [exerciseIds[1], blocks],
    ]);
  });

  it('keeps the publication intact when the original changes or is deleted', async () => {
    await author
      .patch(`/routines/${routineId}`)
      .send({
        name: `E2E pub A renamed ${stamp}`,
        items: [{ exerciseId: exerciseIds[2], position: 0, blocks: [] }],
      })
      .expect(200);

    const stored = await prisma.publication.findUniqueOrThrow({
      where: { id: publication.id },
      include: { routines: { include: { items: true } } },
    });
    expect(stored.name).toBe(`E2E pub A ${stamp}`);
    expect(stored.routines[0].name).toBe(`E2E pub A ${stamp}`);
    expect(
      stored.routines[0].items
        .sort((a, b) => a.position - b.position)
        .map((i) => i.exerciseId),
    ).toEqual([exerciseIds[0], exerciseIds[1]]);

    const scratch = (
      await author
        .post('/routines')
        .send({
          name: `E2E pub scratch ${stamp}`,
          items: [{ exerciseId: exerciseIds[0], position: 0, blocks }],
        })
        .expect(201)
    ).body.id as string;
    const scratchPub = (
      await publish(author, 'routines', scratch, {
        slug: slug('scratch'),
      }).expect(201)
    ).body as Published;
    await author.delete(`/routines/${scratch}`).expect(200);
    expect(
      await prisma.publication.count({ where: { id: scratchPub.id } }),
    ).toBe(1);
  });

  it('publishes a program with its routines in rotation order', async () => {
    const res = await publish(author, 'programs', programId, {
      slug: slug('back'),
    }).expect(201);
    const program = res.body as Published;

    expect(program.kind).toBe('PROGRAM');
    expect(program.routines.map((r) => [r.position, r.name])).toEqual([
      [0, `E2E pub B ${stamp}`],
      [1, `E2E pub A renamed ${stamp}`],
    ]);
  });

  it('rejects a slug already taken by the same kind', async () => {
    await publish(author, 'routines', otherRoutineId, {
      slug: slug('back'),
    }).expect(409);
  });

  it.each(['Bad Slug', 'ab', 'new', 'trailing-', 'tilde-ñ'])(
    'rejects the invalid slug "%s"',
    async (bad) => {
      await publish(author, 'routines', otherRoutineId, { slug: bad }).expect(
        400,
      );
    },
  );

  it('only publishes your own routines and programs', async () => {
    await publish(intruder, 'routines', routineId, {
      slug: slug('stolen'),
    }).expect(404);
    await publish(intruder, 'programs', programId, {
      slug: slug('stolen'),
    }).expect(404);
  });

  it('rejects publishing an empty program', async () => {
    const empty = (
      await author
        .post('/programs')
        .send({ name: `E2E pub empty ${stamp}`, routineIds: [] })
        .expect(201)
    ).body.id as string;
    await publish(author, 'programs', empty, {
      slug: slug('empty'),
    }).expect(400);
  });

  it('tells whether a slug is free for a kind', async () => {
    const check = (kind: string, value: string) =>
      author.get('/publications/slug-available').query({ kind, slug: value });

    expect((await check('ROUTINE', slug('back')).expect(200)).body).toEqual({
      available: false,
    });
    expect((await check('ROUTINE', slug('free')).expect(200)).body).toEqual({
      available: true,
    });
    await check('ROUTINE', 'Bad Slug').expect(400);
    await check('WORKOUT', slug('free')).expect(400);
  });

  it('deletes your publications with your account', async () => {
    const leaver = request.agent(app.getHttpServer());
    const leaverId = await register(leaver, 'leaver');
    const leaverRoutine = (
      await leaver
        .post('/routines')
        .send({
          name: `E2E pub leaver ${stamp}`,
          items: [{ exerciseId: exerciseIds[0], position: 0, blocks }],
        })
        .expect(201)
    ).body.id as string;
    await publish(leaver, 'routines', leaverRoutine, {
      slug: slug('leaver'),
    }).expect(201);

    await leaver.delete('/auth/me').send({ password }).expect(200);

    expect(
      await prisma.publication.count({ where: { authorId: leaverId } }),
    ).toBe(0);
    expect(
      await prisma.publication.count({ where: { id: publication.id } }),
    ).toBe(1);
  });
});
