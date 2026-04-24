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
    return this.workoutsService.create(user.externalId, dto);
  }

  @Get('today')
  findToday(@CurrentUser() user: any) {
    return this.workoutsService.findToday(user.externalId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.workoutsService.findAll(
      user.externalId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workoutsService.findOne(user.externalId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(user.externalId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workoutsService.remove(user.externalId, id);
  }
}
