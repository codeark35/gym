import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { parseLocalDate, getTodayInTimezone, dateToLocalString, dateParts, dateFromParts, addDays } from '../common/utils/date.utils';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getSummary(googleId: string, dateStr?: string) {
    try {
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
    } catch (error: any) {
      this.logger.error(`[getSummary] Error for user ${googleId}: ${error.message}`, error.stack);
      return {
        totalWorkouts: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyVolumeKg: 0,
        uniqueExercises: 0,
        favoriteExercise: undefined,
      };
    }
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
    try {
      const user = await this.usersService.findByGoogleId(googleId);
      
      const today = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();
      
      // Get start of week (Monday) using UTC-3 parts
      const { year, month, day, dayOfWeek } = dateParts(today);
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = dateFromParts(year, month, day + diff);

      const endOfWeek = addDays(startOfWeek, 6);

      // Get profile for recurring rest days
      const profile = await this.prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: { restDaysOfWeek: true },
      });
      const recurringDays: number[] = profile?.restDaysOfWeek ?? [];

      // Get workouts for this week
      const workouts = await this.prisma.workout.findMany({
        where: {
          userId: user.id,
          date: { gte: startOfWeek, lte: endOfWeek },
        },
        select: { date: true, status: true },
      });

      // Get explicit rest days for this week
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
        const { dayOfWeek: dow } = dateParts(currentDate);
        
        const workout = workouts.find(w => dateToLocalString(w.date) === currentDateStr);
        const restDay = restDays.find(r => dateToLocalString(r.date) === currentDateStr);
        const isRecurringRest = recurringDays.includes(dow);
        
        if (workout && workout.status === 'COMPLETED') {
          activity.push({ day: days[i], status: 'completed', intensity: 100 });
        } else if (workout && workout.status === 'IN_PROGRESS') {
          activity.push({ day: days[i], status: 'active', intensity: 70 });
        } else if (restDay || isRecurringRest) {
          activity.push({ day: days[i], status: 'rest', intensity: 20 });
        } else {
          activity.push({ day: days[i], status: 'empty', intensity: 0 });
        }
      }

      return activity;
    } catch (error: any) {
      this.logger.error(`[getWeeklyActivity] Error for user ${googleId}: ${error.message}`, error.stack);
      const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
      return days.map(day => ({ day, status: 'empty', intensity: 0 }));
    }
  }

  async getTodayRestDay(googleId: string, dateStr?: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const date = dateStr ? parseLocalDate(dateStr) : getTodayInTimezone();

    try {
      const explicit = await this.prisma.restDay.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date,
          },
        },
      });
      if (explicit) return explicit;

      // Check recurring rest days from profile
      const profile = await this.prisma.userProfile.findUnique({
        where: { userId: user.id },
      });
      if (profile?.restDaysOfWeek?.length) {
        const { dayOfWeek } = dateParts(date);
        if (profile.restDaysOfWeek.includes(dayOfWeek)) {
          return { userId: user.id, date, isRecurring: true } as any;
        }
      }

      return null;
    } catch (e: any) {
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

  async registerRestDaysBulk(googleId: string, dates: string[]) {
    const user = await this.usersService.findByGoogleId(googleId);
    const results: any[] = [];

    for (const dateStr of dates) {
      const restDate = parseLocalDate(dateStr);
      try {
        const result = await this.prisma.restDay.upsert({
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
        results.push(result);
      } catch (e: any) {
        this.logger.warn(`registerRestDaysBulk: skipping ${dateStr}: ${e.message}`);
      }
    }

    return { registered: results.length, total: dates.length };
  }

  async removeRestDay(googleId: string, dateStr: string) {
    const user = await this.usersService.findByGoogleId(googleId);
    const date = parseLocalDate(dateStr);

    try {
      await this.prisma.restDay.delete({
        where: {
          userId_date: {
            userId: user.id,
            date,
          },
        },
      });
      return { removed: true };
    } catch (e: any) {
      return { removed: false };
    }
  }
}
