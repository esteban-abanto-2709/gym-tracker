import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  ParseEnumPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { SetType } from '@prisma/client';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutRangeDto } from './dto/workout-range.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createWorkoutDto: CreateWorkoutDto,
  ) {
    return this.workoutsService.create(user.id, createWorkoutDto);
  }

  @Get('recommendation')
  async getRecommendation(
    @CurrentUser() user: AuthUser,
    @Query('exerciseId') exerciseId: string,
    @Query('equipmentId') equipmentId?: string,
    @Query('setType', new ParseEnumPipe(SetType, { optional: true }))
    setType?: SetType,
    @Query('step', new ParseIntPipe({ optional: true })) step?: number,
  ) {
    return this.workoutsService.getRecommendation(
      user.id,
      exerciseId,
      equipmentId,
      setType,
      step,
    );
  }

  @Get('progress')
  async getProgress(
    @CurrentUser() user: AuthUser,
    @Query('exerciseId') exerciseId: string,
    @Query('routineId') routineId?: string,
    @Query('tz') tz?: string,
  ) {
    return this.workoutsService.getProgress(user.id, exerciseId, routineId, tz);
  }

  @Get('days')
  async getDays(@CurrentUser() user: AuthUser, @Query('tz') tz?: string) {
    return this.workoutsService.getDays(user.id, tz);
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() range: WorkoutRangeDto,
  ) {
    return this.workoutsService.findAll(user.id, range.from, range.to);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(id, user.id, updateWorkoutDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.workoutsService.remove(id, user.id);
  }
}
