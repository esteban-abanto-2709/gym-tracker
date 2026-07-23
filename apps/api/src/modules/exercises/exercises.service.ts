import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto) {
    const name = createExerciseDto.name.trim();
    const { equipment } = createExerciseDto;

    const existing = await this.prisma.exercise.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        equipment,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.exercise.create({
      data: { name, equipment },
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
