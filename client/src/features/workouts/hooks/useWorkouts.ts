import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Workout, PaginatedResponse } from '../../../types/workout.types';
import { todayISO } from '../../../utils/date.utils';

export function useWorkouts(page = 1) {
  return useQuery<PaginatedResponse<Workout>>({
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
  const today = todayISO();
  return useQuery<Workout | null>({
    queryKey: ['workout', 'today', today],
    queryFn: async () => {
      const res = await api.get<{ data: Workout | null }>(`/workouts/today?date=${today}`);
      return res.data.data ?? null;
    },
  });
}

export function useWorkoutsForDate(date: string) {
  return useQuery<Workout[]>({
    queryKey: ['workouts', 'date', date],
    queryFn: async () => {
      const res = await api.get<{ data: Workout[] }>(`/workouts/date/${date}`);
      return res.data.data ?? [];
    },
    enabled: !!date,
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; date?: string; bodyWeight?: number }) => {
      const res = await api.post<{ data: Workout }>('/workouts', data);
      return res.data.data ?? res.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['workout', 'today'] });
      if (vars.date) {
        qc.invalidateQueries({ queryKey: ['workouts', 'date', vars.date] });
      }
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
      console.log('useUpdateWorkout onSuccess, invalidating queries');
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
      qc.invalidateQueries({ queryKey: ['workouts', 'date'] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'active'] });
      qc.invalidateQueries({ queryKey: ['workout', 'by-id'] });
      qc.invalidateQueries({ queryKey: ['workout', 'today'] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'active'] });
      qc.invalidateQueries({ queryKey: ['workout', 'by-id'] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useDeleteSet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ workoutId, setId }: { workoutId: string; setId: string }) => {
      const res = await api.delete(`/workouts/${workoutId}/sets/${setId}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout', 'active'] });
      qc.invalidateQueries({ queryKey: ['workout', 'by-id'] });
      qc.invalidateQueries({ queryKey: ['workout', 'today'] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
