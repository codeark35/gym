import { IsOptional, IsString, IsIn, IsNumber, IsDateString } from 'class-validator';

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
  @IsIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;
}
