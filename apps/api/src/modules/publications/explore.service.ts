import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PublicationKind } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { itemsInclude } from '../routines/routines.service';
import { uniqueName } from '../programs/programs.service';
import { publicationInclude } from './publications.service';
import type { ExploreSort } from './dto/explore.dto';

// ponytail: fixed page of 50, add cursor pagination when Explore outgrows it
const PAGE_SIZE = 50;

const orderBy: Record<
  ExploreSort,
  Prisma.PublicationOrderByWithRelationInput[]
> = {
  likes: [{ likes: { _count: 'desc' } }, { publishedAt: 'desc' }],
  copies: [{ copies: { _count: 'desc' } }, { publishedAt: 'desc' }],
  recent: [{ publishedAt: 'desc' }],
};

const socialInclude = (userId: string) => ({
  author: { select: { username: true, slug: true } },
  likes: { where: { userId }, select: { userId: true } },
  _count: { select: { likes: true, copies: true } },
});

type SocialFields = {
  authorId: string;
  author: { username: string; slug: string };
  likes: { userId: string }[];
  _count: { likes: number; copies: number };
};

function withSocial<T extends SocialFields>(publication: T, userId: string) {
  const { author, authorId, likes, _count, ...rest } = publication;
  return {
    ...rest,
    author,
    likeCount: _count.likes,
    copyCount: _count.copies,
    likedByMe: likes.length > 0,
    isMine: authorId === userId,
  };
}

type SnapshotRoutine = Prisma.PublicationRoutineGetPayload<{
  include: { items: true };
}>;

@Injectable()
export class ExploreService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, kind: PublicationKind, sort: ExploreSort) {
    return this.summaries(userId, {
      where: { kind },
      orderBy: orderBy[sort],
      take: PAGE_SIZE,
    });
  }

  mine(userId: string) {
    return this.summaries(userId, {
      where: { authorId: userId },
      orderBy: [{ publishedAt: 'desc' }],
    });
  }

  private async summaries(
    userId: string,
    query: Pick<Prisma.PublicationFindManyArgs, 'where' | 'orderBy' | 'take'>,
  ) {
    const publications = await this.prisma.publication.findMany({
      ...query,
      include: {
        ...socialInclude(userId),
        routines: {
          orderBy: { position: 'asc' },
          select: { name: true, _count: { select: { items: true } } },
        },
      },
    });
    return publications.map((publication) => {
      const { routines, ...rest } = withSocial(publication, userId);
      return {
        ...rest,
        routines: routines.map((routine) => ({
          name: routine.name,
          exerciseCount: routine._count.items,
        })),
      };
    });
  }

  async findOne(userId: string, kind: PublicationKind, slug: string) {
    const publication = await this.prisma.publication.findUnique({
      where: { kind_slug: { kind, slug } },
      include: { ...publicationInclude, ...socialInclude(userId) },
    });
    if (!publication) {
      throw new NotFoundException(`Publication ${slug} not found`);
    }
    return withSocial(publication, userId);
  }

  async setLike(
    userId: string,
    kind: PublicationKind,
    slug: string,
    liked: boolean,
  ) {
    const publication = await this.prisma.publication.findUnique({
      where: { kind_slug: { kind, slug } },
      select: { id: true, authorId: true },
    });
    if (!publication) {
      throw new NotFoundException(`Publication ${slug} not found`);
    }
    if (publication.authorId === userId) {
      throw new ForbiddenException('You cannot like your own publication');
    }

    const like = { userId, publicationId: publication.id };
    if (liked) {
      await this.prisma.publicationLike.createMany({
        data: [like],
        skipDuplicates: true,
      });
    } else {
      await this.prisma.publicationLike.deleteMany({ where: like });
    }
    const likeCount = await this.prisma.publicationLike.count({
      where: { publicationId: publication.id },
    });
    return { likeCount, likedByMe: liked };
  }

  async copyRoutine(userId: string, slug: string) {
    const publication = await this.findSnapshot(PublicationKind.ROUTINE, slug);
    return this.copySingleRoutine(userId, publication, publication.routines[0]);
  }

  async copyProgram(userId: string, slug: string, routinePosition?: number) {
    const publication = await this.findSnapshot(PublicationKind.PROGRAM, slug);

    if (routinePosition !== undefined) {
      const routine = publication.routines.find(
        (r) => r.position === routinePosition,
      );
      if (!routine) {
        throw new NotFoundException(
          `Routine ${routinePosition} not found in ${slug}`,
        );
      }
      return this.copySingleRoutine(userId, publication, routine);
    }

    const [programs, user] = await Promise.all([
      this.prisma.program.findMany({
        where: { userId },
        select: { name: true },
      }),
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { activeProgramId: true },
      }),
    ]);
    const routineNames = await this.routineNames(userId);
    const activated = user.activeProgramId === null;

    const program = await this.prisma.$transaction(async (tx) => {
      const copy = await tx.program.create({
        data: {
          userId,
          name: uniqueName(
            publication.name,
            new Set(programs.map((p) => p.name)),
          ),
        },
      });
      for (const routine of publication.routines) {
        await tx.routine.create({
          data: this.routineData(userId, routine, routineNames, {
            programId: copy.id,
            programPosition: routine.position,
          }),
        });
      }
      if (activated) {
        await tx.user.update({
          where: { id: userId },
          data: { activeProgramId: copy.id },
        });
      }
      await this.recordCopy(tx, userId, publication);
      return tx.program.findUniqueOrThrow({
        where: { id: copy.id },
        include: {
          routines: {
            include: itemsInclude,
            orderBy: { programPosition: 'asc' },
          },
        },
      });
    });

    return { program, activated };
  }

  private async findSnapshot(kind: PublicationKind, slug: string) {
    const publication = await this.prisma.publication.findUnique({
      where: { kind_slug: { kind, slug } },
      include: {
        routines: {
          orderBy: { position: 'asc' },
          include: { items: { orderBy: { position: 'asc' } } },
        },
      },
    });
    if (!publication) {
      throw new NotFoundException(`Publication ${slug} not found`);
    }
    return publication;
  }

  private async copySingleRoutine(
    userId: string,
    publication: { id: string; authorId: string },
    routine: SnapshotRoutine,
  ) {
    const routineNames = await this.routineNames(userId);
    return this.prisma.$transaction(async (tx) => {
      const copy = await tx.routine.create({
        data: this.routineData(userId, routine, routineNames),
        include: itemsInclude,
      });
      await this.recordCopy(tx, userId, publication);
      return { routine: copy };
    });
  }

  private async routineNames(userId: string) {
    const routines = await this.prisma.routine.findMany({
      where: { userId },
      select: { name: true },
    });
    return new Set(routines.map((r) => r.name));
  }

  private routineData(
    userId: string,
    routine: SnapshotRoutine,
    taken: Set<string>,
    program: { programId: string; programPosition: number } | null = null,
  ): Prisma.RoutineUncheckedCreateInput {
    const name = uniqueName(routine.name, taken);
    taken.add(name);
    return {
      userId,
      name,
      ...program,
      items: {
        create: routine.items.map((item) => ({
          exerciseId: item.exerciseId,
          position: item.position,
          blocks: item.blocks as Prisma.InputJsonValue,
        })),
      },
    };
  }

  private recordCopy(
    tx: Prisma.TransactionClient,
    userId: string,
    publication: { id: string; authorId: string },
  ) {
    if (publication.authorId === userId) return;
    return tx.publicationCopy.createMany({
      data: [{ userId, publicationId: publication.id }],
      skipDuplicates: true,
    });
  }
}
