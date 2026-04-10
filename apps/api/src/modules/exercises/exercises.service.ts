import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto) {
    // If the exercise already exists by name, we could return it, 
    // but the schema has @unique on name, so we should do an upsert or findFirst to be safe.
    let existing = await this.prisma.exercise.findUnique({
      where: { name: createExerciseDto.name }
    });
    
    if (existing) {
      return existing;
    }

    return this.prisma.exercise.create({
      data: {
        name: createExerciseDto.name,
        equipment: createExerciseDto.equipment,
        description: createExerciseDto.description,
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
