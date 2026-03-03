import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkoutDto: CreateWorkoutDto) {
    return this.prisma.workout.create({
      data: {
        exercise: createWorkoutDto.exercise,
        description: createWorkoutDto.description || '',
        reps: createWorkoutDto.reps,
        weight: createWorkoutDto.weight,
        opinion: createWorkoutDto.opinion || '',
      },
    });
  }
}
