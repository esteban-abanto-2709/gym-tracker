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

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  async create(@Body() createWorkoutDto: CreateWorkoutDto) {
    return this.workoutsService.create(createWorkoutDto);
  }

  @Get('dates')
  async findDates() {
    return this.workoutsService.findDistinctDates();
  }

  @Get('recommendation')
  async getRecommendation(
    @Query('exerciseId') exerciseId: string,
    @Query('isApproximation') isApproximation?: string,
  ) {
    return this.workoutsService.getRecommendation(
      exerciseId,
      isApproximation === 'true',
    );
  }

  @Get()
  async findAll(@Query('date') date?: string) {
    return this.workoutsService.findAll(date);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(id, updateWorkoutDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.workoutsService.remove(id);
  }
}
