import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PublicationsService } from './publications.service';
import { ExploreService } from './explore.service';
import {
  PublishDto,
  RenamePublicationDto,
  SlugAvailableDto,
} from './dto/publish.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller()
export class PublicationsController {
  constructor(
    private readonly publicationsService: PublicationsService,
    private readonly exploreService: ExploreService,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Post('routines/:id/publish')
  async publishRoutine(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() publishDto: PublishDto,
  ) {
    return this.publicationsService.publishRoutine(user.id, id, publishDto);
  }

  @UseGuards(ThrottlerGuard)
  @Post('programs/:id/publish')
  async publishProgram(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() publishDto: PublishDto,
  ) {
    return this.publicationsService.publishProgram(user.id, id, publishDto);
  }

  @Get('publications/slug-available')
  async slugAvailable(@Query() query: SlugAvailableDto) {
    return this.publicationsService.isSlugAvailable(query.kind, query.slug);
  }

  @Get('publications/mine')
  async mine(@CurrentUser() user: AuthUser) {
    return this.exploreService.mine(user.id);
  }

  @Patch('publications/:id')
  async rename(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() renameDto: RenamePublicationDto,
  ) {
    return this.publicationsService.rename(user.id, id, renameDto.name);
  }

  @Delete('publications/:id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.publicationsService.remove(user.id, id);
  }
}
