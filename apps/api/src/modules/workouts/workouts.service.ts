import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

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

  async findAll() {
    return this.prisma.workout.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateWorkoutDto: UpdateWorkoutDto) {
    return this.prisma.workout.update({
      where: { id },
      data: updateWorkoutDto,
    });
  }

  async remove(id: string) {
    return this.prisma.workout.delete({
      where: { id },
    });
  }
}
