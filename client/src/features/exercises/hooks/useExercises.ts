import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Exercise } from '../../../types/workout.types';

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const res = await api.get<{ data: Exercise[] }>('/exercises');
      return (res.data.data ?? res.data) as Exercise[];
    },
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSearchExercises(q: string) {
  return useQuery({
    queryKey: ['exercises', 'search', q],
    queryFn: async () => {
      const res = await api.get<{ data: Exercise[] }>(`/exercises/search?q=${q}`);
      return (res.data.data ?? res.data) as Exercise[];
    },
    enabled: q.length > 0,
  });
}

export function useExerciseHistory(exerciseId: string) {
  return useQuery({
    queryKey: ['exercise', exerciseId, 'history'],
    queryFn: async () => {
      const res = await api.get(`/exercises/${exerciseId}/history`);
      return res.data.data ?? res.data;
    },
    enabled: !!exerciseId,
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      muscleGroup: string;
      equipment: string;
      movementType: string;
      nameEs?: string;
    }) => {
      const res = await api.post<{ data: Exercise }>('/exercises', data);
      return res.data.data ?? res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercises'] }),
  });
}
