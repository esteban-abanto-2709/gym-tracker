import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './providers/prisma/prisma.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';

@Module({
  imports: [PrismaModule, WorkoutsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
