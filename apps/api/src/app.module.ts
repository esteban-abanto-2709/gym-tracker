import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ExerciseNamesInterceptor } from './common/interceptors/exercise-names.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './providers/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { RoutinesModule } from './modules/routines/routines.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { MeasurementsModule } from './modules/measurements/measurements.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ExercisesModule,
    EquipmentModule,
    WorkoutsModule,
    RoutinesModule,
    ProgramsModule,
    MeasurementsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: ExerciseNamesInterceptor },
  ],
})
export class AppModule {}
