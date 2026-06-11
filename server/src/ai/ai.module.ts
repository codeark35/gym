import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiNotificationsService } from './ai-notifications.service';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [UsersModule, PrismaModule, NotificationsModule, ScheduleModule.forRoot()],
  providers: [AiService, AiNotificationsService],
  controllers: [AiController],
})
export class AiModule {}
