import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateExerciseDto } from './dto/create-exercise.dto';

@UseGuards(JwtAuthGuard)
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.exercisesService.findAll(user.externalId);
  }

  @Get('search')
  search(@CurrentUser() user: any, @Query('q') q: string) {
    return this.exercisesService.search(user.externalId, q ?? '');
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateExerciseDto) {
    return this.exercisesService.create(user.externalId, dto);
  }

  @Get(':id/history')
  getHistory(@CurrentUser() user: any, @Param('id') id: string) {
    return this.exercisesService.getHistory(user.externalId, id);
  }
}
