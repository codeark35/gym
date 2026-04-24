import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Authentication required');

    const dbUser = await this.prisma.user.findUnique({
      where: { externalId: user.externalId },
      include: { subscription: true },
    });

    if (!dbUser?.subscription?.aiAnalysisEnabled) {
      throw new ForbiddenException(
        'Esta función requiere plan Pro o Gym. Actualizá tu suscripción.',
      );
    }

    return true;
  }
}
