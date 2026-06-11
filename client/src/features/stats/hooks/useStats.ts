import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Stats } from '../../../types/workout.types';
import { todayISO } from '../../../utils/date.utils';

export function useStats() {
  const today = todayISO();
  return useQuery({
    queryKey: ['stats', 'summary', today],
    queryFn: async () => {
      const res = await api.get<{ data: Stats }>(`/stats/summary?date=${today}`);
      return (res.data.data ?? res.data) as Stats;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useStreak() {
  const today = todayISO();
  return useQuery({
    queryKey: ['stats', 'streak', today],
    queryFn: async () => {
      const res = await api.get(`/stats/streak?date=${today}`);
      return res.data.data ?? res.data;
    },
  });
}

export function useVolumeWeekly() {
  const today = todayISO();
  return useQuery({
    queryKey: ['stats', 'volume-weekly', today],
    queryFn: async () => {
      const res = await api.get(`/stats/volume-weekly?date=${today}`);
      return (res.data.data ?? res.data) as { week: string; totalVolume: number }[];
    },
  });
}

export function useFrequency(weeks = 8) {
  const today = todayISO();
  return useQuery({
    queryKey: ['stats', 'frequency', weeks, today],
    queryFn: async () => {
      const res = await api.get(`/stats/frequency?weeks=${weeks}&date=${today}`);
      return (res.data.data ?? res.data) as { muscleGroup: string; totalSets: number }[];
    },
  });
}

export function useWeeklyActivity() {
  const today = todayISO();
  return useQuery({
    queryKey: ['stats', 'weekly-activity', today],
    queryFn: async () => {
      const res = await api.get(`/stats/weekly-activity?date=${today}`);
      return (res.data.data ?? res.data) as { day: string; status: string; intensity: number }[];
    },
  });
}

export function useTodayRestDay() {
  const today = todayISO();
  return useQuery({
    queryKey: ['stats', 'rest-day', today],
    queryFn: async () => {
      const res = await api.get(`/stats/rest-day?date=${today}`);
      return res.data.data ?? res.data;
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
      queryClient.invalidateQueries({ queryKey: ['stats', 'rest-day'] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'weekly-activity'] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'summary'] });
    },
    onError: (err: any) => {
      console.error('Rest day error:', err?.response?.data ?? err?.message ?? err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', 'rest-day'] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'weekly-activity'] });
    },
  });
}
