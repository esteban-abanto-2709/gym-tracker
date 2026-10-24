import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { ListSessionsDto } from './dto/list-sessions.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async list(@CurrentUser() user: AuthUser, @Query() query: ListSessionsDto) {
    return this.sessionsService.list(user.id, query.before, query.limit);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessionsService.findOne(user.id, id);
  }
}
