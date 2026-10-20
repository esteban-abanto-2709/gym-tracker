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

describe('Publication likes (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let author: Agent;
  let reader: Agent;
  let third: Agent;
  const userIds: string[] = [];

  const likedSlug = `e2e-like-hit-${stamp}`;
  const quietSlug = `e2e-like-quiet-${stamp}`;
  const programSlug = `e2e-like-program-${stamp}`;

  let client = 0;
  const ip = () => `192.0.2.${100 + (++client % 150)}`;
  const register = async (agent: Agent, name: string) => {
    const res = await agent
      .post('/auth/register')
      .send({
        email: `e2e-like-${name}-${stamp}@test.local`,
        username: `e2elike${name}${stamp}`,
        password,
      })
      .expect(201);
    userIds.push((res.body as { id: string }).id);
  };
  const like = (agent: Agent, path: string) =>
    agent.put(`/explore/${path}/like`).set('cf-connecting-ip', ip());
  const unlike = (agent: Agent, path: string) =>
    agent.delete(`/explore/${path}/like`).set('cf-connecting-ip', ip());
  const listed = async (agent: Agent, slug: string) => {
    const res = await agent
      .get('/explore/routines')
      .query({ sort: 'likes' })
      .expect(200);
    const all = res.body as {
      slug: string;
      likeCount: number;
      likedByMe: boolean;
    }[];
    return { all, item: all.find((p) => p.slug === slug)! };
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

    const exerciseId = (
      await prisma.exercise.findFirstOrThrow({ where: { createdById: null } })
    ).id;
    const routine = async (name: string) =>
      (
        await author
          .post('/routines')
          .send({ name, items: [{ exerciseId, position: 0, blocks: [] }] })
          .expect(201)
      ).body.id as string;
    const hit = await routine(`Like hit ${stamp}`);
    const quiet = await routine(`Like quiet ${stamp}`);
    const programId = (
      await author
        .post('/programs')
        .send({ name: `Like program ${stamp}`, routineIds: [hit] })
        .expect(201)
    ).body.id as string;

    const publish = (path: string, slug: string) =>
      author
        .post(`/${path}/publish`)
        .set('cf-connecting-ip', ip())
        .send({ slug })
        .expect(201);
    await publish(`routines/${quiet}`, quietSlug);
    await publish(`routines/${hit}`, likedSlug);
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

  it('counts one like per account, however many times it is sent', async () => {
    const first = await like(reader, `routines/${likedSlug}`).expect(200);
    expect(first.body).toEqual({ likeCount: 1, likedByMe: true });

    const again = await like(reader, `routines/${likedSlug}`).expect(200);
    expect(again.body).toEqual({ likeCount: 1, likedByMe: true });

    await like(third, `routines/${likedSlug}`).expect(200);
    expect((await listed(reader, likedSlug)).item).toMatchObject({
      likeCount: 2,
      likedByMe: true,
    });
    expect((await listed(author, likedSlug)).item.likedByMe).toBe(false);
  });

  it('removes a like and stays idempotent', async () => {
    const res = await unlike(third, `routines/${likedSlug}`).expect(200);
    expect(res.body).toEqual({ likeCount: 1, likedByMe: false });

    await unlike(third, `routines/${likedSlug}`).expect(200);
    expect((await listed(third, likedSlug)).item).toMatchObject({
      likeCount: 1,
      likedByMe: false,
    });
  });

  it('rejects liking your own publication', async () => {
    await like(author, `routines/${likedSlug}`).expect(403);
    expect((await listed(author, likedSlug)).item.likeCount).toBe(1);
  });

  it('likes programs on their own path', async () => {
    await like(reader, `programs/${likedSlug}`).expect(404);
    const res = await like(reader, `programs/${programSlug}`).expect(200);
    expect(res.body).toEqual({ likeCount: 1, likedByMe: true });
  });

  it('sorts the most liked first', async () => {
    const slugs = (await listed(reader, likedSlug)).all.map((p) => p.slug);
    expect(slugs.indexOf(likedSlug)).toBeLessThan(slugs.indexOf(quietSlug));
  });

  it('drops the likes of an account when it is deleted', async () => {
    await like(third, `routines/${likedSlug}`).expect(200);
    expect((await listed(reader, likedSlug)).item.likeCount).toBe(2);

    await third.delete('/auth/me').send({ password }).expect(200);

    expect((await listed(reader, likedSlug)).item.likeCount).toBe(1);
  });
});
