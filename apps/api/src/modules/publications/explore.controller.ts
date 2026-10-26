import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PublicationKind } from '@prisma/client';
import { Public } from '@/common/decorators/public.decorator';
import { ExploreService } from './explore.service';
import { CopyProgramDto, ExploreQueryDto } from './dto/explore.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

const LIKE_LIMIT = { default: { limit: 30, ttl: 60_000 } };

@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Public()
  @Get('routines')
  async listRoutines(
    @CurrentUser() user: AuthUser | undefined,
    @Query() query: ExploreQueryDto,
  ) {
    return this.exploreService.list(
      user?.id ?? null,
      PublicationKind.ROUTINE,
      query.sort,
    );
  }

  @Public()
  @Get('programs')
  async listPrograms(
    @CurrentUser() user: AuthUser | undefined,
    @Query() query: ExploreQueryDto,
  ) {
    return this.exploreService.list(
      user?.id ?? null,
      PublicationKind.PROGRAM,
      query.sort,
    );
  }

  @Public()
  @Get('routines/:slug')
  async findRoutine(
    @CurrentUser() user: AuthUser | undefined,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.findOne(
      user?.id ?? null,
      PublicationKind.ROUTINE,
      slug,
    );
  }

  @Public()
  @Get('programs/:slug')
  async findProgram(
    @CurrentUser() user: AuthUser | undefined,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.findOne(
      user?.id ?? null,
      PublicationKind.PROGRAM,
      slug,
    );
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

  @UseGuards(ThrottlerGuard)
  @Throttle(LIKE_LIMIT)
  @Put('routines/:slug/like')
  async likeRoutine(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.setLike(
      user.id,
      PublicationKind.ROUTINE,
      slug,
      true,
    );
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(LIKE_LIMIT)
  @Put('programs/:slug/like')
  async likeProgram(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.setLike(
      user.id,
      PublicationKind.PROGRAM,
      slug,
      true,
    );
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(LIKE_LIMIT)
  @Delete('routines/:slug/like')
  async unlikeRoutine(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.setLike(
      user.id,
      PublicationKind.ROUTINE,
      slug,
      false,
    );
  }

  @UseGuards(ThrottlerGuard)
  @Throttle(LIKE_LIMIT)
  @Delete('programs/:slug/like')
  async unlikeProgram(
    @CurrentUser() user: AuthUser,
    @Param('slug') slug: string,
  ) {
    return this.exploreService.setLike(
      user.id,
      PublicationKind.PROGRAM,
      slug,
      false,
    );
  }
}
