import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { parseLocalDate, getTodayInTimezone, dateToLocalString } from '../common/utils/date.utils';

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getSummary(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    
    // Use local date from frontend or fallback to UTC-3
    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    console.log('getSummary - dateStr:', dateStr, 'today:', today);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalWorkouts, { current: currentStreak, longest: longestStreak }, weekSets, uniqueExercisesResult] =
      await Promise.all([
        this.prisma.workout.count({ where: { userId: user.id, status: 'COMPLETED' } }),
        this.getStreak(googleId, dateStr),
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

  async getStreak(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);

    const workouts = await this.prisma.workout.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    const uniqueDates = [
      ...new Set(workouts.map((w) => dateToLocalString(w.date))),
    ].sort().reverse();

    // Use local date from frontend or fallback to UTC-3
    const today = dateStr ? dateToLocalString(parseLocalDate(dateStr)) : dateToLocalString(getTodayInTimezone());

    // Current streak
    let current = 0;
    let cursor = today;
    for (const date of uniqueDates) {
      if (date === cursor) {
        current++;
        const d = new Date(cursor + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        cursor = dateToLocalString(d);
      } else if (date < cursor) {
        break;
      }
    }

    // Longest streak
    let longest = 0;
    let temp = 1;
    const sorted = [...uniqueDates].sort();
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1] + 'T00:00:00');
      prev.setDate(prev.getDate() + 1);
      if (dateToLocalString(prev) === sorted[i]) {
        temp++;
      } else {
        longest = Math.max(longest, temp);
        temp = 1;
      }
    }
    longest = Math.max(longest, temp, current);

    return { current, longest };
  }

  async getFrequency(googleId: string, weeks = 8, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    
    // Use local date from frontend or fallback to UTC-3
    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    const since = new Date(today);
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

  async getVolumeWeekly(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    
    // Use local date from frontend or fallback to UTC-3
    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    const since = new Date(today);
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
      const key = dateToLocalString(weekStart);
      byWeek[key] = (byWeek[key] ?? 0) + (set.volume ?? 0);
    }

    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, totalVolume]) => ({ week, totalVolume: Math.round(totalVolume) }));
  }

  async getWeeklyActivity(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    
    // Use local date from frontend or fallback to UTC-3
    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    today.setHours(0, 0, 0, 0);
    console.log('getWeeklyActivity - dateStr:', dateStr, 'today:', today);
    
    // Get start of week (Monday)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    // Get workouts for this week
    const workouts = await this.prisma.workout.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfWeek, lte: endOfWeek },
      },
      select: { date: true, status: true },
    });

    // Get rest days for this week
    const restDays = await this.prisma.restDay.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfWeek, lte: endOfWeek },
      },
      select: { date: true },
    });

    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const activity: { day: string; status: string; intensity: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = dateToLocalString(currentDate);
      
      const workout = workouts.find(w => dateToLocalString(w.date) === dateStr);
      const restDay = restDays.find(r => dateToLocalString(r.date) === dateStr);
      
      if (workout && workout.status === 'COMPLETED') {
        activity.push({ day: days[i], status: 'completed', intensity: 100 });
      } else if (workout && workout.status === 'IN_PROGRESS') {
        activity.push({ day: days[i], status: 'active', intensity: 70 });
      } else if (restDay) {
        activity.push({ day: days[i], status: 'rest', intensity: 20 });
      } else {
        activity.push({ day: days[i], status: 'empty', intensity: 0 });
      }
    }

    return activity;
  }

  async registerRestDay(googleId: string, date?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const restDate = date ? parseLocalDate(date) : getTodayInTimezone();
    restDate.setHours(0, 0, 0, 0);
    console.log('registerRestDay - date:', date, 'restDate:', restDate);

    return this.prisma.restDay.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: restDate,
        },
      },
      update: {},
      create: {
        userId: user.id,
        date: restDate,
      },
    });
  }
}
