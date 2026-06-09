import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { SetsModule } from './sets/sets.module';
import { ProgressModule } from './progress/progress.module';
import { StatsModule } from './stats/stats.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ExercisesModule,
    WorkoutsModule,
    SetsModule,
    ProgressModule,
    StatsModule,
    AiModule,
  ],
})
export class AppModule {}
