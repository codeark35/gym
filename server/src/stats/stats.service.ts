import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getSummary(googleId: string) {
    const user = await this.usersService.findByGoogleId(googleId);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalWorkouts, { current: currentStreak, longest: longestStreak }, weekSets, uniqueExercisesResult] =
      await Promise.all([
        this.prisma.workout.count({ where: { userId: user.id, status: 'COMPLETED' } }),
        this.getStreak(googleId),
        this.prisma.set.findMany({
          where: {
            workout: { userId: user.id, date: { gte: startOfWeek } },
            isWarmup: false,
          },
          select: { volume: true, exerciseId: true },
        }),
        this.prisma.set.groupBy({
          by: ['exerciseId'],
          where: { workout: { userId: user.id } },
          _count: true,
          orderBy: { _count: { exerciseId: 'desc' } },
          take: 1,
        }),
      ]);

    const weeklyVolumeKg = weekSets.reduce((acc, s) => acc + (s.volume ?? 0), 0);
    const uniqueExercises = new Set(weekSets.map((s) => s.exerciseId)).size;

    let favoriteExercise: string | undefined;
    if (uniqueExercisesResult.length > 0) {
      const ex = await this.prisma.exercise.findUnique({
        where: { id: uniqueExercisesResult[0].exerciseId },
      });
      favoriteExercise = ex?.nameEs ?? ex?.name;
    }

    return {
      totalWorkouts,
      currentStreak,
      longestStreak,
      weeklyVolumeKg: Math.round(weeklyVolumeKg),
      uniqueExercises,
      favoriteExercise,
    };
  }

  async getStreak(googleId: string) {
    const user = await this.usersService.findByGoogleId(googleId);

    const workouts = await this.prisma.workout.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    const uniqueDates = [
      ...new Set(workouts.map((w) => w.date.toISOString().split('T')[0])),
    ].sort().reverse();

    const today = new Date().toISOString().split('T')[0];

    // Current streak
    let current = 0;
    let cursor = today;
    for (const date of uniqueDates) {
      if (date === cursor) {
        current++;
        const d = new Date(cursor);
        d.setDate(d.getDate() - 1);
        cursor = d.toISOString().split('T')[0];
      } else if (date < cursor) {
        break;
      }
    }

    // Longest streak
    let longest = 0;
    let temp = 1;
    const sorted = [...uniqueDates].sort();
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      prev.setDate(prev.getDate() + 1);
      if (prev.toISOString().split('T')[0] === sorted[i]) {
        temp++;
      } else {
        longest = Math.max(longest, temp);
        temp = 1;
      }
    }
    longest = Math.max(longest, temp, current);

    return { current, longest };
  }

  async getFrequency(googleId: string, weeks = 8) {
    const user = await this.usersService.findByGoogleId(googleId);
    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);

    const sets = await this.prisma.set.findMany({
      where: {
        workout: { userId: user.id, date: { gte: since } },
        isWarmup: false,
      },
      include: { exercise: { select: { muscleGroup: true } } },
    });

    const freq: Record<string, number> = {};
    for (const set of sets) {
      const mg = set.exercise.muscleGroup;
      freq[mg] = (freq[mg] ?? 0) + 1;
    }

    return Object.entries(freq).map(([muscleGroup, totalSets]) => ({
      muscleGroup,
      totalSets,
    }));
  }

  async getVolumeWeekly(googleId: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const since = new Date();
    since.setDate(since.getDate() - 12 * 7);

    const sets = await this.prisma.set.findMany({
      where: {
        workout: { userId: user.id, date: { gte: since } },
        isWarmup: false,
      },
      include: { workout: { select: { date: true } } },
    });

    const byWeek: Record<string, number> = {};
    for (const set of sets) {
      const d = new Date(set.workout.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      byWeek[key] = (byWeek[key] ?? 0) + (set.volume ?? 0);
    }

    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, totalVolume]) => ({ week, totalVolume: Math.round(totalVolume) }));
  }
}
