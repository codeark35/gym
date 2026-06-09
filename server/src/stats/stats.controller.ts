import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: any) {
    return this.statsService.getSummary(user.googleId);
  }

  @Get('streak')
  getStreak(@CurrentUser() user: any) {
    return this.statsService.getStreak(user.googleId);
  }

  @Get('frequency')
  getFrequency(@CurrentUser() user: any, @Query('weeks') weeks = '8') {
    return this.statsService.getFrequency(user.googleId, parseInt(weeks));
  }

  @Get('volume-weekly')
  getVolumeWeekly(@CurrentUser() user: any) {
    return this.statsService.getVolumeWeekly(user.googleId);
  }
}
