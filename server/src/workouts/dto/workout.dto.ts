import { IsOptional, IsString, IsIn, IsNumber, Matches } from 'class-validator';

export class CreateWorkoutDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
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
