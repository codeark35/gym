import { Module } from '@nestjs/common';
import { SetsService } from './sets.service';
import { SetsController } from './sets.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [SetsService],
  controllers: [SetsController],
  exports: [SetsService],
})
export class SetsModule {}
