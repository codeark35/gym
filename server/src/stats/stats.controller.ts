import { Controller, Get, Post, Query, UseGuards, Body } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: any, @Query('date') date?: string) {
    console.log('GET /stats/summary - date param:', date);
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
    console.log('GET /stats/weekly-activity - date param:', date);
    return this.statsService.getWeeklyActivity(user.googleId, date);
  }

  @Post('rest-day')
  registerRestDay(@CurrentUser() user: any, @Body('date') date: string) {
    console.log('POST /stats/rest-day - date param:', date);
    return this.statsService.registerRestDay(user.googleId, date);
  }
}
