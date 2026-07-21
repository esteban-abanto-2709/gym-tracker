import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createRoutineDto: CreateRoutineDto,
  ) {
    return this.routinesService.create(user.id, createRoutineDto);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.routinesService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.routinesService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateRoutineDto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(id, user.id, updateRoutineDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.routinesService.remove(id, user.id);
  }
}
