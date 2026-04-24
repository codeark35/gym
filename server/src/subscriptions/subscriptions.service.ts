import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createFreeSubscription() {
    return this.prisma.subscription.create({
      data: {
        plan: SubscriptionPlan.FREE,
        maxWorkoutsPerMonth: 12,
        aiAnalysisEnabled: false,
      },
    });
  }

  async upgradeToPro(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (user?.subscription) {
      return this.prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          plan: SubscriptionPlan.PRO,
          maxWorkoutsPerMonth: null,
          aiAnalysisEnabled: true,
        },
      });
    }

    const sub = await this.prisma.subscription.create({
      data: {
        plan: SubscriptionPlan.PRO,
        maxWorkoutsPerMonth: null,
        aiAnalysisEnabled: true,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { subscriptionId: sub.id },
    });

    return sub;
  }
}
