import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationSettingsDto } from './dto/create-notification.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notificationsService.findAll(
      user.id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('unread')
  findUnread(@CurrentUser() user: any) {
    return this.notificationsService.findUnread(user.id);
  }

  @Get('count')
  countUnread(@CurrentUser() user: any) {
    return this.notificationsService.countUnread(user.id);
  }

  @Get('settings')
  getSettings(@CurrentUser() user: any) {
    return this.notificationsService.getSettings(user.id);
  }

  @Post('settings')
  @HttpCode(HttpStatus.OK)
  updateSettings(
    @CurrentUser() user: any,
    @Body() dto: NotificationSettingsDto,
  ) {
    return this.notificationsService.updateSettings(user.id, dto);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.delete(user.id, id);
  }
}
