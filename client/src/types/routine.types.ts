import type { Exercise } from './workout.types';

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  exercise: Exercise;
  sortOrder: number;
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isActive: boolean;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}
