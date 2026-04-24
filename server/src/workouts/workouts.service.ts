import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(externalId: string, dto: CreateWorkoutDto) {
    const user = await this.usersService.findByExternalId(externalId);

    // Check monthly limit for FREE plan
    if (!user.subscription || user.subscription.plan === 'FREE') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const count = await this.prisma.workout.count({
        where: {
          userId: user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (count >= 12) {
        throw new ForbiddenException(
          'Llegaste al límite de 12 workouts mensuales del plan gratuito.',
        );
      }
    }

    const date = dto.date ? new Date(dto.date) : new Date();

    return this.prisma.workout.create({
      data: {
        userId: user.id,
        date,
        name: dto.name,
        notes: dto.notes,
        bodyWeight: dto.bodyWeight,
      },
      include: { sets: { include: { exercise: true } } },
    });
  }

  async findAll(externalId: string, page = 1, limit = 20) {
    const user = await this.usersService.findByExternalId(externalId);

    const where: any = { userId: user.id };

    // FREE plan: limit to last 3 months
    if (!user.subscription || user.subscription.plan === 'FREE') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      where.date = { gte: threeMonthsAgo };
    }

    const [data, total] = await Promise.all([
      this.prisma.workout.findMany({
        where,
        include: { sets: { include: { exercise: true } } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.workout.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(externalId: string, id: string) {
    const user = await this.usersService.findByExternalId(externalId);
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId: user.id },
      include: { sets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
    });

    if (!workout) throw new NotFoundException('Workout no encontrado');
    return workout;
  }

  async findToday(externalId: string) {
    const user = await this.usersService.findByExternalId(externalId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.workout.findFirst({
      where: {
        userId: user.id,
        date: { gte: today, lt: tomorrow },
      },
      include: { sets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
    });
  }

  async update(externalId: string, id: string, dto: UpdateWorkoutDto) {
    const user = await this.usersService.findByExternalId(externalId);
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!workout) throw new NotFoundException('Workout no encontrado');

    return this.prisma.workout.update({
      where: { id },
      data: dto,
      include: { sets: { include: { exercise: true } } },
    });
  }

  async remove(externalId: string, id: string) {
    const user = await this.usersService.findByExternalId(externalId);
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId: user.id },
    });
    if (!workout) throw new NotFoundException('Workout no encontrado');
    await this.prisma.workout.delete({ where: { id } });
    return { message: 'Workout eliminado' };
  }
}
