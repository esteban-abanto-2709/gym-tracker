import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PublicationKind } from '@prisma/client';
import { withUniqueName } from '@/common/unique-name';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { PublishDto } from './dto/publish.dto';

const itemsOrdered = {
  items: { orderBy: { position: 'asc' as const } },
};

export const publicationInclude = {
  routines: {
    orderBy: { position: 'asc' as const },
    include: {
      items: {
        orderBy: { position: 'asc' as const },
        include: { exercise: { include: { names: true } } },
      },
    },
  },
};

type SourceRoutine = Prisma.RoutineGetPayload<{ include: typeof itemsOrdered }>;

@Injectable()
export class PublicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async publishRoutine(userId: string, routineId: string, dto: PublishDto) {
    const routine = await this.prisma.routine.findFirst({
      where: { id: routineId, userId },
      include: itemsOrdered,
    });
    if (!routine) {
      throw new NotFoundException(`Routine ${routineId} not found`);
    }
    return this.publish(userId, PublicationKind.ROUTINE, routine.name, dto, [
      routine,
    ]);
  }

  async publishProgram(userId: string, programId: string, dto: PublishDto) {
    const program = await this.prisma.program.findFirst({
      where: { id: programId, userId },
      include: {
        routines: {
          orderBy: { programPosition: 'asc' },
          include: itemsOrdered,
        },
      },
    });
    if (!program) {
      throw new NotFoundException(`Program ${programId} not found`);
    }
    if (program.routines.length === 0) {
      throw new BadRequestException('Program has no routines');
    }
    return this.publish(
      userId,
      PublicationKind.PROGRAM,
      program.name,
      dto,
      program.routines,
    );
  }

  async rename(userId: string, id: string, name: string) {
    await this.findOwn(userId, id);
    return this.prisma.publication.update({
      where: { id },
      data: { name: name.trim() },
      select: { id: true, name: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwn(userId, id);
    await this.prisma.publication.delete({ where: { id } });
    return { id };
  }

  private async findOwn(userId: string, id: string) {
    const publication = await this.prisma.publication.findFirst({
      where: { id, authorId: userId },
      select: { id: true },
    });
    if (!publication) {
      throw new NotFoundException(`Publication ${id} not found`);
    }
    return publication;
  }

  async isSlugAvailable(kind: PublicationKind, slug: string) {
    const taken = await this.prisma.publication.count({
      where: { kind, slug },
    });
    return { available: taken === 0 };
  }

  private publish(
    authorId: string,
    kind: PublicationKind,
    name: string,
    dto: PublishDto,
    routines: SourceRoutine[],
  ) {
    return withUniqueName(
      () =>
        this.prisma.publication.create({
          data: {
            kind,
            slug: dto.slug,
            name,
            description: dto.description?.trim() || null,
            authorId,
            routines: {
              create: routines.map((routine, position) => ({
                name: routine.name,
                position,
                items: {
                  create: routine.items.map((item) => ({
                    exerciseId: item.exerciseId,
                    position: item.position,
                    blocks: item.blocks as Prisma.InputJsonValue,
                  })),
                },
              })),
            },
          },
          include: publicationInclude,
        }),
      'Slug already taken',
    );
  }
}
