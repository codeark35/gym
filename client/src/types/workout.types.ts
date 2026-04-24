export type MuscleGroup =
  | 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS'
  | 'BICEPS' | 'TRICEPS' | 'CORE' | 'GLUTES'
  | 'CALVES' | 'FOREARMS' | 'FULL_BODY';

export type Equipment =
  | 'BARBELL' | 'DUMBBELL' | 'MACHINE' | 'CABLE'
  | 'BODYWEIGHT' | 'KETTLEBELL' | 'RESISTANCE_BAND' | 'OTHER';

export type MovementType =
  | 'PUSH' | 'PULL' | 'HINGE' | 'SQUAT' | 'CARRY' | 'ISOLATION';

export interface Exercise {
  id: string;
  name: string;
  nameEs?: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  movementType: MovementType;
  isGlobal: boolean;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  exercise: Exercise;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  rir?: number;
  isWarmup: boolean;
  isPR: boolean;
  notes?: string;
  oneRepMax?: number;
  volume?: number;
  createdAt: string;
}

export interface Workout {
  id: string;
  date: string;
  name?: string;
  notes?: string;
  durationMin?: number;
  bodyWeight?: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  sets: WorkoutSet[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgressEntry {
  date: string;
  maxWeightKg: number;
  bestOneRepMax: number;
  totalVolume: number;
  totalSets: number;
  isPR: boolean;
}

export interface Stats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  weeklyVolumeKg: number;
  uniqueExercises: number;
  favoriteExercise?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface UserProfile {
  id: string;
  userId: string;
  birthDate?: string;
  weightKg?: number;
  heightCm?: number;
  fitnessGoal: string;
  experienceLevel: string;
  preferredUnit: 'KG' | 'LB';
}

export interface User {
  id: string;
  externalId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  profile?: UserProfile;
  subscription?: {
    id: string;
    plan: 'FREE' | 'PRO' | 'GYM';
    aiAnalysisEnabled: boolean;
  };
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: 'Pecho',
  BACK: 'Espalda',
  LEGS: 'Piernas',
  SHOULDERS: 'Hombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  CORE: 'Core',
  GLUTES: 'Glúteos',
  CALVES: 'Gemelos',
  FOREARMS: 'Antebrazos',
  FULL_BODY: 'Full Body',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  BARBELL: 'Barra',
  DUMBBELL: 'Mancuernas',
  MACHINE: 'Máquina',
  CABLE: 'Polea',
  BODYWEIGHT: 'Peso corporal',
  KETTLEBELL: 'Kettlebell',
  RESISTANCE_BAND: 'Banda elástica',
  OTHER: 'Otro',
};
