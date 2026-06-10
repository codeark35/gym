import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { parseLocalDate, getTodayInTimezone, dateToLocalString, dateParts, dateFromParts, addDays } from '../common/utils/date.utils';

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getSummary(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    
    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    const { year, month, day, dayOfWeek } = dateParts(today);
    const startOfWeek = dateFromParts(year, month, day - dayOfWeek);

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

    const today = dateStr ? dateToLocalString(parseLocalDate(dateStr)) : dateToLocalString(getTodayInTimezone());

    // Current streak
    let current = 0;
    let cursor = today;
    for (const date of uniqueDates) {
      if (date === cursor) {
        current++;
        const { year, month, day } = dateParts(parseLocalDate(cursor));
        const prev = dateFromParts(year, month, day - 1);
        cursor = dateToLocalString(prev);
      } else if (date < cursor) {
        break;
      }
    }

    // Longest streak
    let longest = 0;
    let temp = 1;
    const sorted = [...uniqueDates].sort();
    for (let i = 1; i < sorted.length; i++) {
      const { year, month, day } = dateParts(parseLocalDate(sorted[i - 1]));
      const next = dateFromParts(year, month, day + 1);
      if (dateToLocalString(next) === sorted[i]) {
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
    
    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    const { year, month, day } = dateParts(today);
    const since = dateFromParts(year, month, day - weeks * 7);

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
    
    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    const { year, month, day } = dateParts(today);
    const since = dateFromParts(year, month, day - 12 * 7);

    const sets = await this.prisma.set.findMany({
      where: {
        workout: { userId: user.id, date: { gte: since } },
        isWarmup: false,
      },
      include: { workout: { select: { date: true } } },
    });

    const byWeek: Record<string, number> = {};
    for (const set of sets) {
      const { year, month, day, dayOfWeek } = dateParts(set.workout.date);
      const weekStart = dateFromParts(year, month, day - dayOfWeek);
      const key = dateToLocalString(weekStart);
      byWeek[key] = (byWeek[key] ?? 0) + (set.volume ?? 0);
    }

    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, totalVolume]) => ({ week, totalVolume: Math.round(totalVolume) }));
  }

  async getWeeklyActivity(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    
    const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
    
    // Get start of week (Monday) using UTC-3 parts
    const { year, month, day, dayOfWeek } = dateParts(today);
    // dayOfWeek: 0=Sun, 1=Mon... Monday offset = dayOfWeek - 1, but if Sunday we want -6
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const startOfWeek = dateFromParts(year, month, day + diff);

    const endOfWeek = addDays(startOfWeek, 6);

    // Get workouts for this week
    const workouts = await this.prisma.workout.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfWeek, lte: endOfWeek },
      },
      select: { date: true, status: true },
    });

    // Get rest days for this week (table may not exist yet — fallback to empty)
    let restDays: { date: Date }[] = [];
    try {
      restDays = await this.prisma.restDay.findMany({
        where: {
          userId: user.id,
          date: { gte: startOfWeek, lte: endOfWeek },
        },
        select: { date: true },
      });
    } catch (e: any) {
      // table rest_days might not exist yet
    }

    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const activity: { day: string; status: string; intensity: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startOfWeek, i);
      const currentDateStr = dateToLocalString(currentDate);
      
      const workout = workouts.find(w => dateToLocalString(w.date) === currentDateStr);
      const restDay = restDays.find(r => dateToLocalString(r.date) === currentDateStr);
      
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

  async getTodayRestDay(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const date = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();

    try {
      return await this.prisma.restDay.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date,
          },
        },
      });
    } catch (e: any) {
      // table rest_days might not exist yet
      return null;
    }
  }

  async registerRestDay(googleId: string, date?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const restDate = date ? parseLocalDate(date) : getTodayInTimezone();

    try {
      return await this.prisma.restDay.upsert({
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
    } catch (e: any) {
      console.error('registerRestDay failed:', e?.message ?? e);
      return null;
    }
  }
}
