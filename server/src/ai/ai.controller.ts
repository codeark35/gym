import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyzeDto, ChatDto } from './dto/ai.dto';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  analyze(@CurrentUser() user: any, @Body() dto: AnalyzeDto) {
    return this.aiService.analyze(user.googleId, dto.type, dto.context);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  chat(@CurrentUser() user: any, @Body() dto: ChatDto) {
    return this.aiService.chat(user.googleId, dto.message);
  }
}
