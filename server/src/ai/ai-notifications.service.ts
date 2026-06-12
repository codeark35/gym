import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AnalysisType } from '../ai/dto/ai.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AiNotificationsService {
  private readonly logger = new Logger(AiNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async analyzeUsersForNotifications() {
    this.logger.log('Iniciando análisis de usuarios para notificaciones IA...');

    const users = await this.prisma.user.findMany({
      include: { profile: true },
    });

    for (const user of users) {
      try {
        await this.analyzeUser(user.googleId, user.id, user.profile);
      } catch (err) {
        this.logger.error(`Error analizando usuario ${user.id}: ${err.message}`);
      }
    }

    this.logger.log('Análisis de usuarios completado.');
  }

  @OnEvent('set.pr')
  async handlePrEvent(payload: { setId: string; userId: string }) {
    const { setId, userId } = payload;
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { enablePRNotifications: true },
    });

    if (!profile?.enablePRNotifications) return;

    const set = await this.prisma.set.findUnique({
      where: { id: setId },
      include: { exercise: true },
    });
    if (!set || set.isWarmup) return;

    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        type: NotificationType.PR,
        data: { path: ['setId'], equals: setId },
      },
    });

    if (existing) return;

    await this.notificationsService.create(
      userId,
      NotificationType.PR,
      'Nuevo record personal!',
      `${set.exercise.nameEs ?? set.exercise.name}: ${set.weightKg}kg x ${set.reps} reps (1RM estimado: ${set.oneRepMax?.toFixed(1)}kg)`,
      { setId: set.id, exerciseId: set.exerciseId, weightKg: set.weightKg, reps: set.reps },
    );
    this.logger.log(`[PR] Notificación creada para usuario ${userId} (set ${setId})`);
  }

  private async analyzeUser(googleId: string, userId: string, profile: any) {
    if (!profile) return;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const workouts = await this.prisma.workout.findMany({
      where: {
        userId,
        date: { gte: lastWeek },
        status: 'COMPLETED',
      },
      include: {
        sets: {
          include: { exercise: true },
          where: { isWarmup: false },
        },
      },
    });

    const totalSets = workouts.reduce((acc, w) => acc + w.sets.length, 0);
    const totalVolume = workouts.reduce((acc, w) => acc + w.sets.reduce((a, s) => a + (s.volume ?? 0), 0), 0);

    // 1. Overtraining detection
    if (profile.enableOvertrainingAlerts && workouts.length > 6) {
      const avgDuration = workouts.reduce((acc, w) => acc + (w.durationMin ?? 0), 0) / workouts.length;
      if (avgDuration > 90 && totalSets > 120) {
        await this.notificationsService.create(
          userId,
          NotificationType.OVERTRAINING,
          'Posible sobreentrenamiento detectado',
          `Entrenaste ${workouts.length} veces esta semana con ${Math.round(avgDuration)} min promedio y ${totalSets} series totales. Considerá un descanso activo o un deload.`,
          { workouts: workouts.length, totalSets, avgDuration: Math.round(avgDuration) },
        );
        this.logger.log(`[OVERTRAINING] Notificación creada para usuario ${userId}`);
      }
    }

    // 2. PR notifications
    if (profile.enablePRNotifications) {
      const prs = await this.prisma.set.findMany({
        where: {
          workout: { userId },
          isPR: true,
          isWarmup: false,
          createdAt: { gte: lastWeek },
        },
        include: { exercise: true },
      });

      for (const pr of prs) {
        const existing = await this.prisma.notification.findFirst({
          where: {
            userId,
            type: NotificationType.PR,
            data: { path: ['setId'], equals: pr.id },
          },
        });

        if (!existing) {
          await this.notificationsService.create(
            userId,
            NotificationType.PR,
            'Nuevo record personal!',
            `${pr.exercise.nameEs ?? pr.exercise.name}: ${pr.weightKg}kg x ${pr.reps} reps (1RM estimado: ${pr.oneRepMax?.toFixed(1)}kg)`,
            { setId: pr.id, exerciseId: pr.exerciseId, weightKg: pr.weightKg, reps: pr.reps },
          );
        }
      }
    }

    // 3. AI suggestions (if enabled and enough data)
    if (profile.enableAISuggestions && workouts.length >= 3) {
      try {
        const aiResponse = await this.aiService.analyze(googleId, AnalysisType.GENERAL);
        
        if (aiResponse && aiResponse.length > 20) {
          const lines = aiResponse.split('\n').filter(l => l.trim());
          const title = lines[0]?.slice(0, 100) ?? 'Sugerencia de entrenamiento';
          const message = lines.slice(0, 5).join('\n').slice(0, 500);

          await this.notificationsService.create(
            userId,
            NotificationType.SUGGESTION,
            title,
            message,
            { aiType: 'GENERAL' },
          );
          this.logger.log(`[SUGGESTION] Notificación IA creada para usuario ${userId}`);
        }
      } catch (err) {
        this.logger.warn(`[SUGGESTION] Error generando sugerencia IA para usuario ${userId}: ${err.message}`);
      }
    }

    // 4. Routine suggestions (if enabled)
    if (profile.enableRoutineSuggestions && workouts.length >= 4) {
      try {
        const aiResponse = await this.aiService.analyze(googleId, AnalysisType.ROUTINE);
        
        if (aiResponse && aiResponse.includes('rutina')) {
          await this.notificationsService.create(
            userId,
            NotificationType.ROUTINE,
            'Sugerencia de rutina',
            'Nuestra IA analizó tu historial y tiene una recomendación de rutina para vos. Abri el chat de IA para verla completa.',
            { aiType: 'ROUTINE' },
          );
          this.logger.log(`[ROUTINE] Notificación IA creada para usuario ${userId}`);
        }
      } catch (err) {
        this.logger.warn(`[ROUTINE] Error generando rutina IA para usuario ${userId}: ${err.message}`);
      }
    }
  }
}
