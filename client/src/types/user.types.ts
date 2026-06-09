export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  profile?: UserProfile;
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
