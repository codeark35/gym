import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { Stats } from '../../../types/workout.types';

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
