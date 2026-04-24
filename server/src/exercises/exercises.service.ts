import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async findAll(externalId: string) {
    const user = await this.usersService.findByExternalId(externalId);
    return this.prisma.exercise.findMany({
      where: {
        OR: [{ isGlobal: true }, { userId: user.id }],
      },
      orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
    });
  }

  async search(externalId: string, q: string) {
    const user = await this.usersService.findByExternalId(externalId);
    return this.prisma.exercise.findMany({
      where: {
        OR: [{ isGlobal: true }, { userId: user.id }],
        AND: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { nameEs: { contains: q, mode: 'insensitive' } },
          ],
        },
      },
    });
  }

  async create(externalId: string, dto: CreateExerciseDto) {
    const user = await this.usersService.findByExternalId(externalId);

    // Check custom exercise limit for FREE plan
    const subscription = user.subscription;
    if (!subscription || subscription.plan === 'FREE') {
      const count = await this.prisma.exercise.count({
        where: { userId: user.id },
      });
      if (count >= 5) {
        throw new ForbiddenException(
          'El plan gratuito permite hasta 5 ejercicios personalizados. Actualizá a Pro.',
        );
      }
    }

    return this.prisma.exercise.create({
      data: { ...dto, userId: user.id, isGlobal: false },
    });
  }

  async getHistory(externalId: string, exerciseId: string) {
    const user = await this.usersService.findByExternalId(externalId);
    return this.prisma.set.findMany({
      where: {
        exerciseId,
        workout: { userId: user.id },
        isWarmup: false,
      },
      include: { workout: { select: { date: true, name: true } } },
      orderBy: { workout: { date: 'desc' } },
      take: 100,
    });
  }
}
