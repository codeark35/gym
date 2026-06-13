import { Controller, Get, Post, Delete, Query, UseGuards, Body, Logger } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  private readonly logger = new Logger(StatsController.name);

  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: any, @Query('date') date?: string) {
    this.logger.log(`[summary] user=${user.googleId} date=${date}`);
    return this.statsService.getSummary(user.googleId, date);
  }

  @Get('streak')
  getStreak(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.statsService.getStreak(user.googleId, date);
  }

  @Get('frequency')
  getFrequency(@CurrentUser() user: any, @Query('weeks') weeks = '8', @Query('date') date?: string) {
    return this.statsService.getFrequency(user.googleId, parseInt(weeks), date);
  }

  @Get('volume-weekly')
  getVolumeWeekly(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.statsService.getVolumeWeekly(user.googleId, date);
  }

  @Get('weekly-activity')
  getWeeklyActivity(@CurrentUser() user: any, @Query('date') date?: string) {
    this.logger.log(`[weekly-activity] user=${user.googleId} date=${date}`);
    return this.statsService.getWeeklyActivity(user.googleId, date);
  }

  @Get('rest-day')
  getTodayRestDay(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.statsService.getTodayRestDay(user.googleId, date);
  }

  @Post('rest-day')
  async registerRestDay(@CurrentUser() user: any, @Body('date') date: string) {
    try {
      const result = await this.statsService.registerRestDay(user.googleId, date);
      return { data: result };
    } catch (error: any) {
      console.error('Register rest day error:', error);
      return {
        error: true,
        message: error?.message ?? 'Error al registrar día de descanso',
        code: error?.code ?? 'UNKNOWN',
      };
    }
  }

  @Post('rest-days/bulk')
  async registerRestDaysBulk(@CurrentUser() user: any, @Body('dates') dates: string[]) {
    try {
      const result = await this.statsService.registerRestDaysBulk(user.googleId, dates);
      return { data: result };
    } catch (error: any) {
      return {
        error: true,
        message: error?.message ?? 'Error al registrar días de descanso',
      };
    }
  }

  @Delete('rest-day')
  async removeRestDay(@CurrentUser() user: any, @Body('date') date: string) {
    try {
      const result = await this.statsService.removeRestDay(user.googleId, date);
      return { data: result };
    } catch (error: any) {
      return {
        error: true,
        message: error?.message ?? 'Error al eliminar día de descanso',
      };
    }
  }
}
