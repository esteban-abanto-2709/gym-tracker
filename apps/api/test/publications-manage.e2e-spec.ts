import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/providers/prisma/prisma.service';

const stamp = Date.now();
type Agent = ReturnType<typeof request.agent>;

type Mine = {
  id: string;
  kind: string;
  slug: string;
  name: string;
  likeCount: number;
  copyCount: number;
  isMine: boolean;
};

describe('Managing your publications (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let author: Agent;
  let reader: Agent;
  const userIds: string[] = [];

  const routineSlug = `e2e-manage-routine-${stamp}`;
  const programSlug = `e2e-manage-program-${stamp}`;
  let routinePubId: string;
  let programPubId: string;
  let readerCopyId: string;

  let client = 0;
  const ip = () => `198.18.0.${++client}`;
  const register = async (agent: Agent, name: string) => {
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-manage-${name}-${stamp}@test.local`,
        username: `e2emanage${name}${stamp}`,
        password: 'e2e-password',
      })
      .expect(201);
    userIds.push((res.body as { id: string }).id);
  };
  const mine = async (agent: Agent) =>
    (await agent.get('/publications/mine').expect(200)).body as Mine[];

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
    await register(author, 'author');
    await register(reader, 'reader');

    const exerciseId = (
      await prisma.exercise.findFirstOrThrow({ where: { createdById: null } })
    ).id;
    const routineId = (
      await author
        .post('/routines')
        .send({
          name: `Manage routine ${stamp}`,
          items: [{ exerciseId, position: 0, blocks: [] }],
        })
        .expect(201)
    ).body.id as string;
    const programId = (
      await author
        .post('/programs')
        .send({ name: `Manage program ${stamp}`, routineIds: [routineId] })
        .expect(201)
    ).body.id as string;

    const publish = async (path: string, slug: string) =>
      (
        await author
          .post(`/${path}/publish`)
          .set('cf-connecting-ip', ip())
          .send({ slug })
          .expect(201)
      ).body.id as string;
    routinePubId = await publish(`routines/${routineId}`, routineSlug);
    programPubId = await publish(`programs/${programId}`, programSlug);

    readerCopyId = (
      await reader
        .post(`/explore/routines/${routineSlug}/copy`)
        .set('cf-connecting-ip', ip())
        .expect(201)
    ).body.routine.id as string;
    await reader
      .put(`/explore/routines/${routineSlug}/like`)
      .set('cf-connecting-ip', ip())
      .expect(200);
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

  it('lists only your publications, of both kinds, with their counters', async () => {
    const list = await mine(author);

    expect(list.map((p) => p.slug).sort()).toEqual(
      [programSlug, routineSlug].sort(),
    );
    expect(list.find((p) => p.slug === routineSlug)).toMatchObject({
      kind: 'ROUTINE',
      likeCount: 1,
      copyCount: 1,
      isMine: true,
    });
    expect(await mine(reader)).toEqual([]);
  });

  it('renames a publication but keeps its slug', async () => {
    const res = await author
      .patch(`/publications/${routinePubId}`)
      .send({ name: '  Manage routine V2  ' })
      .expect(200);
    expect(res.body).toEqual({ id: routinePubId, name: 'Manage routine V2' });

    const detail = await reader
      .get(`/explore/routines/${routineSlug}`)
      .expect(200);
    expect(detail.body.name).toBe('Manage routine V2');
    expect(detail.body.slug).toBe(routineSlug);
  });

  it('rejects a blank name and other people renaming', async () => {
    await author
      .patch(`/publications/${routinePubId}`)
      .send({ name: '   ' })
      .expect(400);
    await reader
      .patch(`/publications/${routinePubId}`)
      .send({ name: 'Stolen' })
      .expect(404);
  });

  it('only lets the author delete', async () => {
    await reader.delete(`/publications/${programPubId}`).expect(404);
    expect(
      await prisma.publication.count({ where: { id: programPubId } }),
    ).toBe(1);
  });

  it('deletes a publication and keeps the copies others made', async () => {
    await author
      .delete(`/publications/${routinePubId}`)
      .expect(200, { id: routinePubId });

    await reader.get(`/explore/routines/${routineSlug}`).expect(404);
    expect(
      await prisma.publicationLike.count({
        where: { publicationId: routinePubId },
      }),
    ).toBe(0);
    const copy = await reader.get(`/routines/${readerCopyId}`).expect(200);
    expect(copy.body.items).toHaveLength(1);
    expect((await mine(author)).map((p) => p.slug)).toEqual([programSlug]);
  });
});
