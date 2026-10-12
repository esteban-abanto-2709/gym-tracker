import { Controller, Get, Post, Body } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createExerciseDto: CreateExerciseDto,
  ) {
    return this.exercisesService.create(
      user.id,
      user.locale,
      createExerciseDto,
    );
  }

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.exercisesService.findAll(user.locale);
  }
}
