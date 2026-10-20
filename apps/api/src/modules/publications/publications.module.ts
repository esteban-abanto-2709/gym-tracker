import { Module } from '@nestjs/common';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { ExploreController } from './explore.controller';
import { ExploreService } from './explore.service';

@Module({
  controllers: [PublicationsController, ExploreController],
  providers: [PublicationsService, ExploreService],
})
export class PublicationsModule {}
