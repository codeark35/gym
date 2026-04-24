import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Equipment, MuscleGroup, MovementType } from '@prisma/client';

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nameEs?: string;

  @IsEnum(MuscleGroup)
  muscleGroup: MuscleGroup;

  @IsOptional()
  @IsArray()
  @IsEnum(MuscleGroup, { each: true })
  secondaryMuscles?: MuscleGroup[];

  @IsEnum(Equipment)
  equipment: Equipment;

  @IsEnum(MovementType)
  movementType: MovementType;
}
