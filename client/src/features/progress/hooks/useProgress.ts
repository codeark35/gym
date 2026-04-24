import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { ProgressEntry } from '../../../types/workout.types';

export function useExerciseProgress(exerciseId: string) {
  return useQuery({
    queryKey: ['progress', 'exercise', exerciseId],
    queryFn: async () => {
      const res = await api.get<{ data: ProgressEntry[] }>(
        `/progress/exercise/${exerciseId}`,
      );
      return (res.data.data ?? res.data) as ProgressEntry[];
    },
    enabled: !!exerciseId,
  });
}

export function usePersonalRecord(exerciseId: string) {
  return useQuery({
    queryKey: ['progress', 'exercise', exerciseId, 'pr'],
    queryFn: async () => {
      const res = await api.get(`/progress/exercise/${exerciseId}/pr`);
      return res.data.data ?? res.data;
    },
    enabled: !!exerciseId,
  });
}

export function useOneRMHistory(exerciseId: string) {
  return useQuery({
    queryKey: ['progress', '1rm', exerciseId],
    queryFn: async () => {
      const res = await api.get(`/progress/1rm/${exerciseId}`);
      return (res.data.data ?? res.data) as { date: string; oneRepMax: number }[];
    },
    enabled: !!exerciseId,
  });
}

export function useVolumeByMuscle(from: string, to: string) {
  return useQuery({
    queryKey: ['progress', 'volume', from, to],
    queryFn: async () => {
      const res = await api.get(`/progress/volume?from=${from}&to=${to}`);
      return (res.data.data ?? res.data) as { muscleGroup: string; totalVolume: number }[];
    },
  });
}
