import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
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
    @Query('isApproximation') isApproximation?: string,
    @Query('tz') tz?: string,
  ) {
    return this.workoutsService.getRecommendation(
      user.id,
      exerciseId,
      isApproximation === 'true',
      tz,
    );
  }

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.workoutsService.findAll(user.id);
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
