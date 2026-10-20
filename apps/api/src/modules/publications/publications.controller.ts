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
import { PublicationsService } from './publications.service';
import { PublishDto, SlugAvailableDto } from './dto/publish.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller()
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

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
}
