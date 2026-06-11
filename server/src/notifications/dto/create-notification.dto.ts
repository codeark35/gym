import { IsString, IsOptional, IsEnum, IsJSON, IsBoolean } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  data?: Record<string, any>;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}

export class NotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  enableAISuggestions?: boolean;

  @IsOptional()
  @IsBoolean()
  enableOvertrainingAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  enableRoutineSuggestions?: boolean;

  @IsOptional()
  @IsBoolean()
  enablePRNotifications?: boolean;
}
