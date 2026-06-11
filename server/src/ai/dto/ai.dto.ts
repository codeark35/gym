import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum AnalysisType {
  GENERAL = 'GENERAL',
  PROGRESS = 'PROGRESS',
  VOLUME = 'VOLUME',
  RECOVERY = 'RECOVERY',
  ROUTINE = 'ROUTINE',
  TECHNIQUE = 'TECHNIQUE',
}

export class AnalyzeDto {
  @IsEnum(AnalysisType)
  type: AnalysisType;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'El contexto no puede superar 2000 caracteres' })
  context?: string;
}

export class ChatDto {
  @IsString()
  @MaxLength(4000, { message: 'El mensaje no puede superar 4000 caracteres' })
  message: string;
}
