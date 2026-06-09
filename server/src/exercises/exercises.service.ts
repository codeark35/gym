import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async findAll(googleId: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    return this.prisma.exercise.findMany({
      where: {
        OR: [{ isGlobal: true }, { userId: user.id }],
      },
      orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
    });
  }

  async search(googleId: string, q: string) {
    const user = await this.usersService.findByGoogleId(googleId);
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

  async create(googleId: string, dto: CreateExerciseDto) {
    const user = await this.usersService.findByGoogleId(googleId);

    return this.prisma.exercise.create({
      data: { ...dto, userId: user.id, isGlobal: false },
    });
  }

  async getHistory(googleId: string, exerciseId: string) {
    const user = await this.usersService.findByGoogleId(googleId);
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
