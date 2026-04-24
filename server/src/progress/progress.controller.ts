import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('exercise/:exerciseId')
  getExerciseProgress(
    @CurrentUser() user: any,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.progressService.getExerciseProgress(user.externalId, exerciseId);
  }

  @Get('exercise/:exerciseId/pr')
  getPersonalRecord(
    @CurrentUser() user: any,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.progressService.getPersonalRecord(user.externalId, exerciseId);
  }

  @Get('volume')
  getVolumeByMuscle(
    @CurrentUser() user: any,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const toDate = to || new Date().toISOString().split('T')[0];
    const fromDate =
      from ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    return this.progressService.getVolumeByMuscle(
      user.externalId,
      fromDate,
      toDate,
    );
  }

  @Get('1rm/:exerciseId')
  getOneRMHistory(
    @CurrentUser() user: any,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.progressService.getOneRMHistory(user.externalId, exerciseId);
  }
}
