import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from 'class-validator';

export class CreateSetDto {
  @IsString()
  exerciseId: string;

  @IsNumber()
  @Min(1)
  setNumber: number;

  @IsNumber()
  @Min(1)
  reps: number;

  @IsNumber()
  @Min(0)
  weightKg: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rir?: number;

  @IsOptional()
  @IsBoolean()
  isWarmup?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSetDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  reps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rir?: number;

  @IsOptional()
  @IsBoolean()
  isWarmup?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkCreateSetsDto {
  @IsArray()
  sets: CreateSetDto[];
}
