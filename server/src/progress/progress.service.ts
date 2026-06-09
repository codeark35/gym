import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getExerciseProgress(googleId: string, exerciseId: string) {
    const user = await this.usersService.findByGoogleId(googleId);

    const sets = await this.prisma.set.findMany({
      where: {
        exerciseId,
        workout: { userId: user.id },
        isWarmup: false,
      },
      include: { workout: { select: { date: true } } },
      orderBy: { workout: { date: 'asc' } },
    });

    // Group by date
    const byDate = new Map<string, typeof sets>();
    for (const set of sets) {
      const dateStr = set.workout.date.toISOString().split('T')[0];
      if (!byDate.has(dateStr)) byDate.set(dateStr, []);
      byDate.get(dateStr)!.push(set);
    }

    return Array.from(byDate.entries()).map(([date, dateSets]) => ({
      date,
      maxWeightKg: Math.max(...dateSets.map((s) => s.weightKg)),
      bestOneRepMax: Math.max(...dateSets.map((s) => s.oneRepMax ?? 0)),
      totalVolume: dateSets.reduce((acc, s) => acc + (s.volume ?? 0), 0),
      totalSets: dateSets.length,
      isPR: dateSets.some((s) => s.isPR),
    }));
  }

  async getPersonalRecord(googleId: string, exerciseId: string) {
    const user = await this.usersService.findByGoogleId(googleId);

    return this.prisma.set.findFirst({
      where: {
        exerciseId,
        workout: { userId: user.id },
        isWarmup: false,
      },
      orderBy: { oneRepMax: 'desc' },
      include: { workout: { select: { date: true } }, exercise: true },
    });
  }

  async getVolumeByMuscle(googleId: string, from: string, to: string) {
    const user = await this.usersService.findByGoogleId(googleId);

    const sets = await this.prisma.set.findMany({
      where: {
        workout: {
          userId: user.id,
          date: { gte: new Date(from), lte: new Date(to) },
        },
        isWarmup: false,
      },
      include: { exercise: { select: { muscleGroup: true } } },
    });

    const byMuscle: Record<string, number> = {};
    for (const set of sets) {
      const muscle = set.exercise.muscleGroup;
      byMuscle[muscle] = (byMuscle[muscle] ?? 0) + (set.volume ?? 0);
    }

    return Object.entries(byMuscle).map(([muscleGroup, totalVolume]) => ({
      muscleGroup,
      totalVolume: Math.round(totalVolume),
    }));
  }

  async getOneRMHistory(googleId: string, exerciseId: string) {
    const user = await this.usersService.findByGoogleId(googleId);

    const sets = await this.prisma.set.findMany({
      where: {
        exerciseId,
        workout: { userId: user.id },
        isWarmup: false,
      },
      include: { workout: { select: { date: true } } },
      orderBy: { workout: { date: 'asc' } },
    });

    const byDate = new Map<string, number>();
    for (const set of sets) {
      const dateStr = set.workout.date.toISOString().split('T')[0];
      const current = byDate.get(dateStr) ?? 0;
      if ((set.oneRepMax ?? 0) > current) byDate.set(dateStr, set.oneRepMax ?? 0);
    }

    return Array.from(byDate.entries()).map(([date, oneRepMax]) => ({
      date,
      oneRepMax,
    }));
  }
}
