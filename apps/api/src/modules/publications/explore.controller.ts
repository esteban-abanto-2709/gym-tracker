import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PublicationKind } from '@prisma/client';
import { ExploreService } from './explore.service';
import { CopyProgramDto, ExploreQueryDto } from './dto/explore.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Get('routines')
  async listRoutines(
    @CurrentUser() user: AuthUser,
    @Query() query: ExploreQueryDto,
  ) {
    return this.exploreService.list(
      user.id,
      PublicationKind.ROUTINE,
      query.sort,
    );
  }

  @Get('programs')
  async listPrograms(
    @CurrentUser() user: AuthUser,
    @Query() query: ExploreQueryDto,
  ) {
    return this.exploreService.list(
      user.id,
      PublicationKind.PROGRAM,
      query.sort,
    );
  }

  @Get('routines/:slug')
  async findRoutine(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.findOne(user.id, PublicationKind.ROUTINE, slug);
  }

  @Get('programs/:slug')
  async findProgram(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.findOne(user.id, PublicationKind.PROGRAM, slug);
  }

  @UseGuards(ThrottlerGuard)
  @Post('routines/:slug/copy')
  async copyRoutine(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.copyRoutine(user.id, slug);
  }

  @UseGuards(ThrottlerGuard)
  @Post('programs/:slug/copy')
  async copyProgram(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
    @Body() copyProgramDto: CopyProgramDto,
  ) {
    return this.exploreService.copyProgram(
      user.id,
      slug,
      copyProgramDto.routinePosition,
    );
  }
}
