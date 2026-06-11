import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [RoutinesService],
  controllers: [RoutinesController],
  exports: [RoutinesService],
})
export class RoutinesModule {}
