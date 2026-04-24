export function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)} kg`;
}

export function totalVolume(sets: Array<{ reps: number; weightKg: number; isWarmup: boolean }>): number {
  return sets
    .filter((s) => !s.isWarmup)
    .reduce((acc, s) => acc + s.reps * s.weightKg, 0);
}
