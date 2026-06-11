import { Module } from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { UsersModule } from '../users/users.module';
import { RoutinesModule } from '../routines/routines.module';

@Module({
  imports: [UsersModule, RoutinesModule],
  providers: [WorkoutsService],
  controllers: [WorkoutsController],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
