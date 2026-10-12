import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { slugify } from '../../common/slugify';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createExerciseDto: CreateExerciseDto) {
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

    return this.prisma.exercise.create({
      data: {
        name,
        slug,
        primaryMuscles,
        secondaryMuscles,
        mechanic,
        createdById: userId,
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
