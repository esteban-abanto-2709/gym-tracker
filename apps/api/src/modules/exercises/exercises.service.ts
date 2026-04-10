import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto) {
    const existing = await this.prisma.exercise.findUnique({
      where: { name: createExerciseDto.name },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.exercise.create({
      data: {
        name: createExerciseDto.name,
        equipment: createExerciseDto.equipment,
      },
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
