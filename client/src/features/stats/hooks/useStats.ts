import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Stats } from '../../../types/workout.types';
import { todayISO, dateToLocalISO } from '../../../utils/date.utils';

export function useStats() {
  const today = todayISO();
  const localDate = dateToLocalISO(today);
  return useQuery({
    queryKey: ['stats', 'summary', today],
    queryFn: async () => {
      const res = await api.get<{ data: Stats }>(`/stats/summary?date=${localDate}`);
      return (res.data.data ?? res.data) as Stats;
    },
  });
}

export function useStreak() {
  const today = todayISO();
  const localDate = dateToLocalISO(today);
  return useQuery({
    queryKey: ['stats', 'streak', today],
    queryFn: async () => {
      const res = await api.get(`/stats/streak?date=${localDate}`);
      return res.data.data ?? res.data;
    },
  });
}

export function useVolumeWeekly() {
  const today = todayISO();
  const localDate = dateToLocalISO(today);
  return useQuery({
    queryKey: ['stats', 'volume-weekly', today],
    queryFn: async () => {
      const res = await api.get(`/stats/volume-weekly?date=${localDate}`);
      return (res.data.data ?? res.data) as { week: string; totalVolume: number }[];
    },
  });
}

export function useFrequency(weeks = 8) {
  const today = todayISO();
  const localDate = dateToLocalISO(today);
  return useQuery({
    queryKey: ['stats', 'frequency', weeks, today],
    queryFn: async () => {
      const res = await api.get(`/stats/frequency?weeks=${weeks}&date=${localDate}`);
      return (res.data.data ?? res.data) as { muscleGroup: string; totalSets: number }[];
    },
  });
}

export function useWeeklyActivity() {
  const today = todayISO();
  const localDate = dateToLocalISO(today);
  return useQuery({
    queryKey: ['stats', 'weekly-activity', today],
    queryFn: async () => {
      const res = await api.get(`/stats/weekly-activity?date=${localDate}`);
      return (res.data.data ?? res.data) as { day: string; status: string; intensity: number }[];
    },
  });
}

export function useRegisterRestDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      const localDate = dateToLocalISO(date);
      const res = await api.post('/stats/rest-day', { date: localDate });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats', 'weekly-activity'] });
      queryClient.invalidateQueries({ queryKey: ['stats', 'summary'] });
    },
  });
}
