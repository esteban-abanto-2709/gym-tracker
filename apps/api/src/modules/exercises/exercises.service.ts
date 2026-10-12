import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { slugify } from '../../common/slugify';
import { resolveLocale, toSearchName } from '../../common/locale';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    createExerciseDto: CreateExerciseDto,
    acceptLanguage?: string,
  ) {
    const { primaryMuscles, secondaryMuscles, mechanic } = createExerciseDto;
    const name = createExerciseDto.name.trim();
    const slug = slugify(name);

    const existing = await this.prisma.exercise.findFirst({
      where: {
        OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }],
      },
      orderBy: { createdById: { sort: 'asc', nulls: 'first' } },
    });
    if (existing) {
      return existing;
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { locale: true },
    });

    return this.prisma.exercise.create({
      data: {
        name,
        slug,
        primaryMuscles,
        secondaryMuscles,
        mechanic,
        createdById: userId,
        names: {
          create: {
            locale: resolveLocale(user.locale, acceptLanguage),
            name,
            searchName: toSearchName(name),
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.exercise.findMany({
      orderBy: [
        { createdById: { sort: 'asc', nulls: 'first' } },
        { name: 'asc' },
      ],
    });
  }
}
