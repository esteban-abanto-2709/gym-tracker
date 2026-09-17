import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { slugify } from '../../common/slugify';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto) {
    const name = createExerciseDto.name.trim();
    const slug = slugify(name);

    const existing = await this.prisma.exercise.findUnique({ where: { slug } });
    if (existing) {
      return existing;
    }

    return this.prisma.exercise.create({
      data: { name, slug },
    });
  }

  async findAll() {
    return this.prisma.exercise.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
