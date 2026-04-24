// ─── 1RM Calculations ────────────────────────────────────────

export function calcEpley(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export function calcBrzycki(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg;
  if (reps >= 37) return weightKg; // avoid division by zero/negative
  return Math.round(weightKg * (36 / (37 - reps)) * 10) / 10;
}

export function calcVolume(reps: number, weightKg: number): number {
  return reps * weightKg;
}

export function enrichSet(reps: number, weightKg: number) {
  return {
    oneRepMax: calcEpley(weightKg, reps),
    volume: calcVolume(reps, weightKg),
  };
}

// Format 1RM for display
export function format1RM(value: number): string {
  return `${value.toFixed(1)} kg`;
}
