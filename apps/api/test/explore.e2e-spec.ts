import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
type Agent = ReturnType<typeof request.agent>;

type Listed = {
  slug: string;
  author: { username: string; slug: string };
  likeCount: number;
  copyCount: number;
  likedByMe: boolean;
  isMine: boolean;
  routines: { name: string; exerciseCount: number }[];
};

describe('Explore (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let author: Agent;
  let reader: Agent;
  let third: Agent;
  const userIds: string[] = [];
  let exerciseIds: string[];

  const routineSlug = `e2e-exp-routine-${stamp}`;
  const quietSlug = `e2e-exp-quiet-${stamp}`;
  const programSlug = `e2e-exp-program-${stamp}`;
  const blocks = [{ kind: 'weight_reps', sets: 3, reps: 8, repsMax: 10 }];

  let client = 0;
  const ip = () => `203.0.113.${++client}`;
  const register = async (agent: Agent, name: string) => {
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-exp-${name}-${stamp}@test.local`,
        username: `e2eexp${name}${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    userIds.push((res.body as { id: string }).id);
  };
  const createRoutine = async (agent: Agent, name: string, ids: string[]) =>
    (
      await agent
        .post('/routines')
        .send({
          name,
          items: ids.map((exerciseId, position) => ({
            exerciseId,
            position,
            blocks,
          })),
        })
        .expect(201)
    ).body.id as string;
  const copy = (agent: Agent, path: string, body: object = {}) =>
    agent
      .post(`/explore/${path}/copy`)
      .set('cf-connecting-ip', ip())
      .send(body);
  const listed = async (
    agent: Agent,
    kind: 'routines' | 'programs',
    slug: string,
    sort = 'likes',
  ) => {
    const res = await agent.get(`/explore/${kind}`).query({ sort }).expect(200);
    const body = res.body as Listed[];
    return { all: body, item: body.find((p) => p.slug === slug) };
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

    author = request.agent(app.getHttpServer());
    reader = request.agent(app.getHttpServer());
    third = request.agent(app.getHttpServer());
    await register(author, 'author');
    await register(reader, 'reader');
    await register(third, 'third');

    exerciseIds = (
      await prisma.exercise.findMany({
        where: { createdById: null },
        take: 3,
        orderBy: { slug: 'asc' },
      })
    ).map((e) => e.id);

    const push = await createRoutine(author, `Exp Push ${stamp}`, [
      exerciseIds[0],
      exerciseIds[1],
    ]);
    const pull = await createRoutine(author, `Exp Pull ${stamp}`, [
      exerciseIds[2],
    ]);
    const programId = (
      await author
        .post('/programs')
        .send({ name: `Exp PPL ${stamp}`, routineIds: [push, pull] })
        .expect(201)
    ).body.id as string;

    const publish = (path: string, slug: string) =>
      author
        .post(`/${path}/publish`)
        .set('cf-connecting-ip', ip())
        .send({ slug })
        .expect(201);
    await publish(`routines/${push}`, routineSlug);
    await publish(`routines/${pull}`, quietSlug);
    await publish(`programs/${programId}`, programSlug);
  });

  afterAll(async () => {
    await prisma.publication.deleteMany({
      where: { authorId: { in: userIds } },
    });
    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { activeProgramId: null },
    });
    await prisma.routineItem.deleteMany({
      where: { routine: { userId: { in: userIds } } },
    });
    await prisma.routine.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.program.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  it('lists published routines with their author and counters', async () => {
    const { item } = await listed(reader, 'routines', routineSlug);

    expect(item).toMatchObject({
      author: {
        username: `e2eexpauthor${stamp}`,
        slug: `e2eexpauthor${stamp}`,
      },
      likeCount: 0,
      copyCount: 0,
      likedByMe: false,
      isMine: false,
      routines: [{ name: `Exp Push ${stamp}`, exerciseCount: 2 }],
    });
    expect(item).not.toHaveProperty('authorId');
    expect((await listed(author, 'routines', routineSlug)).item?.isMine).toBe(
      true,
    );
  });

  it('keeps routines and programs apart', async () => {
    expect(
      (await listed(reader, 'programs', routineSlug)).item,
    ).toBeUndefined();
    await reader.get(`/explore/programs/${routineSlug}`).expect(404);
    await reader.get(`/explore/routines/no-such-${stamp}`).expect(404);
  });

  it('shows the full snapshot by slug', async () => {
    const res = await reader
      .get(`/explore/programs/${programSlug}`)
      .expect(200);

    expect(res.body.routines.map((r: { name: string }) => r.name)).toEqual([
      `Exp Push ${stamp}`,
      `Exp Pull ${stamp}`,
    ]);
    expect(res.body.routines[0].items[0].exercise.name).toEqual(
      expect.any(String),
    );
    expect(res.body.copyCount).toBe(0);
  });

  it('copies a routine as a standalone routine and counts the person once', async () => {
    const res = await copy(reader, `routines/${routineSlug}`).expect(201);
    const routine = res.body.routine as {
      id: string;
      name: string;
      programId: string | null;
      items: { exerciseId: string }[];
    };

    expect(routine.name).toBe(`Exp Push ${stamp}`);
    expect(routine.programId).toBeNull();
    expect(routine.items.map((i) => i.exerciseId)).toEqual([
      exerciseIds[0],
      exerciseIds[1],
    ]);

    const again = await copy(reader, `routines/${routineSlug}`).expect(201);
    expect(again.body.routine.name).toBe(`Exp Push ${stamp} (2)`);
    await reader.delete(`/routines/${routine.id}`).expect(200);

    expect(
      (await listed(reader, 'routines', routineSlug)).item?.copyCount,
    ).toBe(1);
  });

  it('lets the author copy their own publication without counting it', async () => {
    await copy(author, `routines/${routineSlug}`).expect(201);

    expect(
      (await listed(author, 'routines', routineSlug)).item?.copyCount,
    ).toBe(1);
  });

  it('copies a whole program and activates it when you had none', async () => {
    const res = await copy(reader, `programs/${programSlug}`).expect(201);

    expect(res.body.activated).toBe(true);
    expect(
      res.body.program.routines.map((r: { name: string }) => r.name),
    ).toEqual([`Exp Push ${stamp}`, `Exp Pull ${stamp}`]);
  });

  it('copies one routine of a program and counts it for the program', async () => {
    const res = await copy(third, `programs/${programSlug}`, {
      routinePosition: 1,
    }).expect(201);

    expect(res.body.routine.name).toBe(`Exp Pull ${stamp}`);
    expect(res.body.routine.programId).toBeNull();
    expect((await listed(third, 'programs', programSlug)).item?.copyCount).toBe(
      2,
    );
    await copy(third, `programs/${programSlug}`, {
      routinePosition: 9,
    }).expect(404);
  });

  it('sorts by copies or recency', async () => {
    const byCopies = (await listed(reader, 'routines', routineSlug, 'copies'))
      .all;
    const slugs = byCopies.map((p) => p.slug);
    expect(slugs.indexOf(routineSlug)).toBeLessThan(slugs.indexOf(quietSlug));

    const recent = (await listed(reader, 'routines', routineSlug, 'recent'))
      .all;
    const recentSlugs = recent.map((p) => p.slug);
    expect(recentSlugs.indexOf(quietSlug)).toBeLessThan(
      recentSlugs.indexOf(routineSlug),
    );

    await reader.get('/explore/routines').query({ sort: 'best' }).expect(400);
  });
});
