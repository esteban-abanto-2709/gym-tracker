import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
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
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.exercisesService.create(
      user.id,
      createExerciseDto,
      acceptLanguage,
    );
  }

  @Get()
  async findAll() {
    return this.exercisesService.findAll();
  }
}
