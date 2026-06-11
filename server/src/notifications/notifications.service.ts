import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, limit = 50, offset = 0) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, readAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async create(userId: string, type: NotificationType, title: string, message: string, data?: Record<string, any>) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ?? undefined,
      },
    });
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async delete(userId: string, notificationId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async getSettings(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: {
        enableAISuggestions: true,
        enableOvertrainingAlerts: true,
        enableRoutineSuggestions: true,
        enablePRNotifications: true,
      },
    });

    if (!profile) {
      return {
        enableAISuggestions: true,
        enableOvertrainingAlerts: true,
        enableRoutineSuggestions: true,
        enablePRNotifications: true,
      };
    }

    return profile;
  }

  async updateSettings(userId: string, settings: {
    enableAISuggestions?: boolean;
    enableOvertrainingAlerts?: boolean;
    enableRoutineSuggestions?: boolean;
    enablePRNotifications?: boolean;
  }) {
    await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(settings.enableAISuggestions !== undefined && { enableAISuggestions: settings.enableAISuggestions }),
        ...(settings.enableOvertrainingAlerts !== undefined && { enableOvertrainingAlerts: settings.enableOvertrainingAlerts }),
        ...(settings.enableRoutineSuggestions !== undefined && { enableRoutineSuggestions: settings.enableRoutineSuggestions }),
        ...(settings.enablePRNotifications !== undefined && { enablePRNotifications: settings.enablePRNotifications }),
      },
      create: {
        userId,
        fitnessGoal: 'STRENGTH',
        experienceLevel: 'INTERMEDIATE',
        preferredUnit: 'KG',
        enableAISuggestions: settings.enableAISuggestions ?? true,
        enableOvertrainingAlerts: settings.enableOvertrainingAlerts ?? true,
        enableRoutineSuggestions: settings.enableRoutineSuggestions ?? true,
        enablePRNotifications: settings.enablePRNotifications ?? true,
      },
    });

    return this.getSettings(userId);
  }
}
