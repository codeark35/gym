import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { ProgressEntry } from '../../../types/workout.types';

const STALE_TIME = 5 * 60 * 1000; // 5 minutos
const RETRY = 2;

export function useExerciseProgress(exerciseId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['progress', 'exercise', exerciseId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const url = `/progress/exercise/${exerciseId}${params.toString() ? '?' + params.toString() : ''}`;
      const res = await api.get<{ data: ProgressEntry[] }>(url);
      return (res.data.data ?? res.data) as ProgressEntry[];
    },
    enabled: !!exerciseId,
    staleTime: STALE_TIME,
    retry: RETRY,
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
    staleTime: STALE_TIME,
    retry: RETRY,
  });
}

export function useOneRMHistory(exerciseId: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['progress', '1rm', exerciseId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const url = `/progress/1rm/${exerciseId}${params.toString() ? '?' + params.toString() : ''}`;
      const res = await api.get(url);
      return (res.data.data ?? res.data) as { date: string; oneRepMax: number }[];
    },
    enabled: !!exerciseId,
    staleTime: STALE_TIME,
    retry: RETRY,
  });
}

export function useVolumeByMuscle(from: string, to: string) {
  return useQuery({
    queryKey: ['progress', 'volume', from, to],
    queryFn: async () => {
      const res = await api.get(`/progress/volume?from=${from}&to=${to}`);
      return (res.data.data ?? res.data) as { muscleGroup: string; totalVolume: number }[];
    },
    staleTime: STALE_TIME,
    retry: RETRY,
  });
}
