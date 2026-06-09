import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyzeDto, ChatDto } from './dto/ai.dto';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  analyze(@CurrentUser() user: any, @Body() dto: AnalyzeDto) {
    return this.aiService.analyze(user.googleId, dto.type, dto.context);
  }

  @Post('chat')
  chat(@CurrentUser() user: any, @Body() dto: ChatDto) {
    return this.aiService.chat(user.googleId, dto.message);
  }
}
