import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateWorkoutDto) {
    return this.workoutsService.create(user.googleId, dto);
  }

  @Post('from-routine/:routineId')
  createFromRoutine(
    @CurrentUser() user: any,
    @Param('routineId') routineId: string,
    @Body('date') date?: string,
  ) {
    return this.workoutsService.createFromRoutine(user.googleId, routineId, date);
  }

  @Get('today')
  findToday(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.workoutsService.findToday(user.googleId, date);
  }

  @Get('date/:date')
  findAllForDate(@CurrentUser() user: any, @Param('date') date: string) {
    return this.workoutsService.findAllForDate(user.googleId, date);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.workoutsService.findAll(
      user.googleId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workoutsService.findOne(user.googleId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(user.googleId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workoutsService.remove(user.googleId, id);
  }
}
