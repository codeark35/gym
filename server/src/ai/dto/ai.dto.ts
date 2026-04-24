import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum AnalysisType {
  GENERAL = 'GENERAL',
  PROGRESS = 'PROGRESS',
  VOLUME = 'VOLUME',
  RECOVERY = 'RECOVERY',
}

export class AnalyzeDto {
  @IsEnum(AnalysisType)
  type: AnalysisType;

  @IsOptional()
  @IsString()
  context?: string;
}

export class ChatDto {
  @IsString()
  message: string;
}
