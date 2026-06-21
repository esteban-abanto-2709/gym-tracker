import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './providers/prisma/prisma.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { RoutinesModule } from './modules/routines/routines.module';

@Module({
  imports: [PrismaModule, ExercisesModule, WorkoutsModule, RoutinesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
