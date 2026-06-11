import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Routine } from '../../../types/routine.types';
import type { PaginatedResponse } from '../../../types/workout.types';

interface CreateRoutineData {
  name: string;
  description?: string;
  exercises: {
    exerciseId: string;
    targetSets?: number;
    targetReps?: number;
    targetWeightKg?: number;
    notes?: string;
  }[];
}

interface UpdateRoutineData {
  name?: string;
  description?: string;
  exercises?: CreateRoutineData['exercises'];
}

export function useRoutines(page = 1, limit = 20) {
  return useQuery<PaginatedResponse<Routine>>({
    queryKey: ['routines', page, limit],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Routine>>(`/routines?page=${page}&limit=${limit}`);
      return res.data;
    },
  });
}

export function useRoutine(id: string) {
  return useQuery<Routine>({
    queryKey: ['routine', id],
    queryFn: async () => {
      const res = await api.get<Routine>(`/routines/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRoutineData) => {
      const res = await api.post<Routine>('/routines', data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

export function useUpdateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoutineData }) => {
      const res = await api.patch<Routine>(`/routines/${id}`, data);
      return res.data;
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['routines'] });
      qc.invalidateQueries({ queryKey: ['routine', id] });
    },
  });
}

export function useDeleteRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/routines/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

export function useToggleRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<Routine>(`/routines/${id}/toggle`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}
