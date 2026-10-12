import { Injectable } from '@nestjs/common';
import type { Locale } from '@prisma/client';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { slugify } from '../../common/slugify';
import { pickName, toSearchName } from '../../common/locale';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    locale: Locale,
    createExerciseDto: CreateExerciseDto,
  ) {
    const { primaryMuscles, secondaryMuscles, mechanic } = createExerciseDto;
    const name = createExerciseDto.name.trim();
    const slug = slugify(name);
    const searchName = toSearchName(name);

    const existing = await this.prisma.exercise.findFirst({
      where: { OR: [{ slug }, { names: { some: { searchName } } }] },
      orderBy: { createdById: { sort: 'asc', nulls: 'first' } },
      include: { names: true },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.exercise.create({
      data: {
        name,
        slug,
        primaryMuscles,
        secondaryMuscles,
        mechanic,
        createdById: userId,
        names: { create: { locale, name, searchName } },
      },
      include: { names: true },
    });
  }

  async findAll(locale: Locale) {
    const exercises = await this.prisma.exercise.findMany({
      include: { names: true },
    });
    const nameOf = (e: (typeof exercises)[number]) => pickName(e.names, locale);
    return exercises
      .sort(
        (a, b) =>
          Number(!!a.createdById) - Number(!!b.createdById) ||
          nameOf(a).localeCompare(nameOf(b), locale),
      )
      .map((exercise) => ({
        ...exercise,
        searchNames: exercise.names.map((n) => n.searchName),
      }));
  }
}
