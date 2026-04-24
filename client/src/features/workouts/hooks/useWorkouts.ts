import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import { Workout, PaginatedResponse } from '../../../types/workout.types';

export function useWorkouts(page = 1) {
  return useQuery({
    queryKey: ['workouts', page],
    queryFn: async () => {
      const res = await api.get<{ data: PaginatedResponse<Workout> }>(
        `/workouts?page=${page}&limit=20`,
      );
      return res.data.data ?? res.data;
    },
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: async () => {
      const res = await api.get<{ data: Workout }>(`/workouts/${id}`);
      return res.data.data ?? res.data;
    },
    enabled: !!id,
  });
}

export function useTodayWorkout() {
  return useQuery({
    queryKey: ['workout', 'today'],
    queryFn: async () => {
      const res = await api.get<{ data: Workout | null }>('/workouts/today');
      return res.data.data ?? res.data ?? null;
    },
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; date?: string; bodyWeight?: number }) => {
      const res = await api.post<{ data: Workout }>('/workouts', data);
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['workout', 'today'] });
    },
  });
}

export function useUpdateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await api.patch<{ data: Workout }>(`/workouts/${id}`, data);
      return res.data.data ?? res.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workout', vars.id] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['workout', 'today'] });
    },
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/workouts/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['workout', 'today'] });
    },
  });
}

export function useAddSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workoutId,
      ...data
    }: {
      workoutId: string;
      exerciseId: string;
      setNumber: number;
      reps: number;
      weightKg: number;
      rpe?: number;
      isWarmup?: boolean;
    }) => {
      const res = await api.post(`/workouts/${workoutId}/sets`, data);
      return res.data.data ?? res.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workout', vars.workoutId] });
      qc.invalidateQueries({ queryKey: ['workout', 'today'] });
    },
  });
}

export function useUpdateSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workoutId,
      setId,
      ...data
    }: {
      workoutId: string;
      setId: string;
      [key: string]: any;
    }) => {
      const res = await api.patch(`/workouts/${workoutId}/sets/${setId}`, data);
      return res.data.data ?? res.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workout', vars.workoutId] });
    },
  });
}

export function useDeleteSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ workoutId, setId }: { workoutId: string; setId: string }) => {
      await api.delete(`/workouts/${workoutId}/sets/${setId}`);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workout', vars.workoutId] });
    },
  });
}
