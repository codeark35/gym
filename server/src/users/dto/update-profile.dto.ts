import { IsOptional, IsString, IsEnum, IsNumber, IsDateString, IsArray } from 'class-validator';
import { FitnessGoal, ExperienceLevel, WeightUnit } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @IsOptional()
  @IsEnum(FitnessGoal)
  fitnessGoal?: FitnessGoal;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @IsOptional()
  @IsEnum(WeightUnit)
  preferredUnit?: WeightUnit;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  restDaysOfWeek?: number[];
}
