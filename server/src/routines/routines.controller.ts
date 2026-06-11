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
import { RoutinesService } from './routines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateRoutineDto, UpdateRoutineDto } from './dto/routine.dto';

@UseGuards(JwtAuthGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateRoutineDto) {
    return this.routinesService.create(user.googleId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.routinesService.findAll(
      user.googleId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.routinesService.findOne(user.googleId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(user.googleId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.routinesService.remove(user.googleId, id);
  }

  @Patch(':id/toggle')
  toggleActive(@CurrentUser() user: any, @Param('id') id: string) {
    return this.routinesService.toggleActive(user.googleId, id);
  }
}
