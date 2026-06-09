import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Stats } from '../../../types/workout.types';

export function useStats() {
  return useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ data: Stats }>('/stats/summary');
      return (res.data.data ?? res.data) as Stats;
    },
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['stats', 'streak'],
    queryFn: async () => {
      const res = await api.get('/stats/streak');
      return res.data.data ?? res.data;
    },
  });
}

export function useVolumeWeekly() {
  return useQuery({
    queryKey: ['stats', 'volume-weekly'],
    queryFn: async () => {
      const res = await api.get('/stats/volume-weekly');
      return (res.data.data ?? res.data) as { week: string; totalVolume: number }[];
    },
  });
}

export function useFrequency(weeks = 8) {
  return useQuery({
    queryKey: ['stats', 'frequency', weeks],
    queryFn: async () => {
      const res = await api.get(`/stats/frequency?weeks=${weeks}`);
      return (res.data.data ?? res.data) as { muscleGroup: string; totalSets: number }[];
    },
  });
}

export function useWeeklyActivity() {
  return useQuery({
    queryKey: ['stats', 'weekly-activity'],
    queryFn: async () => {
      const res = await api.get('/stats/weekly-activity');
      return (res.data.data ?? res.data) as { day: string; status: string; intensity: number }[];
    },
  });
}

export function useRegisterRestDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      const res = await api.post('/stats/rest-day', { date });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', 'weekly-activity'] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'summary'] });
    },
  });
}
