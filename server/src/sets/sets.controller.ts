import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SetsService } from './sets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateSetDto, UpdateSetDto, BulkCreateSetsDto } from './dto/set.dto';

@UseGuards(JwtAuthGuard)
@Controller('workouts/:workoutId/sets')
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Param('workoutId') workoutId: string,
    @Body() dto: CreateSetDto,
  ) {
    return this.setsService.create(user.googleId, workoutId, dto);
  }

  @Post('bulk')
  bulkCreate(
    @CurrentUser() user: any,
    @Param('workoutId') workoutId: string,
    @Body() dto: BulkCreateSetsDto,
  ) {
    return this.setsService.bulkCreate(user.googleId, workoutId, dto.sets);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Param('workoutId') workoutId: string) {
    return this.setsService.findAll(user.googleId, workoutId);
  }

  @Patch(':setId')
  update(
    @CurrentUser() user: any,
    @Param('workoutId') workoutId: string,
    @Param('setId') setId: string,
    @Body() dto: UpdateSetDto,
  ) {
    return this.setsService.update(user.googleId, workoutId, setId, dto);
  }

  @Delete(':setId')
  remove(
    @CurrentUser() user: any,
    @Param('workoutId') workoutId: string,
    @Param('setId') setId: string,
  ) {
    return this.setsService.remove(user.googleId, workoutId, setId);
  }
}
