import { IsOptional, IsString, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { WorkoutStatus } from '@prisma/client';

export class CreateWorkoutDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  bodyWeight?: number;
}

export class UpdateWorkoutDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  durationMin?: number;

  @IsOptional()
  @IsNumber()
  bodyWeight?: number;

  @IsOptional()
  @IsEnum(WorkoutStatus)
  status?: WorkoutStatus;
}
