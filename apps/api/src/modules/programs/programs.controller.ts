import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { SetActiveProgramDto } from './dto/set-active-program.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get('active')
  async findActive(@CurrentUser() user: AuthUser) {
    return this.programsService.findActive(user.id);
  }

  @Put('active')
  async setActive(
    @CurrentUser() user: AuthUser,
    @Body() setActiveProgramDto: SetActiveProgramDto,
  ) {
    return this.programsService.setActive(
      user.id,
      setActiveProgramDto.programId ?? null,
    );
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createProgramDto: CreateProgramDto,
  ) {
    return this.programsService.create(user.id, createProgramDto);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.programsService.findAll(user.id);
  }

  @Get('explore')
  async explore(@CurrentUser() user: AuthUser) {
    return this.programsService.explore(user.id);
  }

  @Post(':id/copy')
  async copy(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.programsService.copy(id, user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.programsService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return this.programsService.update(id, user.id, updateProgramDto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.programsService.remove(id, user.id);
  }
}
