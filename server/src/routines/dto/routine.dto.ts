import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoutineExerciseDto {
  @IsString()
  exerciseId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetSets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetReps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetWeightKg?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRoutineDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  exercises: RoutineExerciseDto[];
}

export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  exercises?: RoutineExerciseDto[];
}
