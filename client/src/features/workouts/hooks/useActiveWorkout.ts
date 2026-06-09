import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Workout } from '../../../types/workout.types';
import { todayISO } from '../../../utils/date.utils';

interface WorkoutSessionState {
  selectedDate: string;
  activeWorkout: Workout | null;
  lastCompletedWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;
}

interface UseActiveWorkoutReturn extends WorkoutSessionState {
  setSelectedDate: (date: string) => void;
  startWorkout: () => Promise<void>;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  clearLastCompleted: () => void;
  resetWorkout: () => void;
  refreshWorkout: () => void;
  isStarting: boolean;
  isFinishing: boolean;
  isCancelling: boolean;
}

/**
 * Hook empresarial para gestionar sesiones de entrenamiento.
 * 
 * Arquitectura:
 * - Mantiene el workout activo en estado local para evitar re-renders problemáticos
 * - Usa queries de React Query solo para carga inicial, no para estado activo
 * - Todas las operaciones (crear, finalizar, cancelar) actualizan el estado local inmediatamente
 * - El backend se sincroniza en background sin afectar la UX
 */
export function useActiveWorkout(): UseActiveWorkoutReturn {
  const qc = useQueryClient();
  const [selectedDate, setSelectedDateState] = useState(todayISO());
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Query para cargar el workout de la fecha seleccionada
  // Solo se usa para carga inicial; luego el estado local es la fuente de verdad
  const { isLoading: isLoadingQuery, data: queryWorkout } = useQuery<Workout | null>({
    queryKey: ['workout', 'active', selectedDate],
    queryFn: async () => {
      if (selectedDate === todayISO()) {
        const res = await api.get<{ data: Workout | null }>('/workouts/today');
        return res.data.data ?? null;
      } else {
        const res = await api.get<{ data: Workout[] }>(`/workouts/date/${selectedDate}`);
        const workouts = res.data.data ?? [];
        return workouts.find((w: Workout) => w.status === 'IN_PROGRESS') ?? null;
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  // Sincronizar query result con estado local
  useEffect(() => {
    if (queryWorkout !== undefined) {
      setActiveWorkout(queryWorkout);
    }
  }, [queryWorkout]);

  // isLoading solo es true si estamos cargando Y no tenemos workout aún
  const isLoading = isLoadingQuery && activeWorkout === null;

  // Crear workout
  const createMutation = useMutation({
    mutationFn: async (data: { date: string }) => {
      const res = await api.post<{ data: Workout }>('/workouts', data);
      return res.data.data ?? res.data;
    },
  });

  // Finalizar workout
  const finishMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await api.patch<{ data: Workout }>(`/workouts/${id}`, { status: 'COMPLETED' });
      return res.data.data ?? res.data;
    },
  });

  // Cancelar workout
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workouts/${id}`);
      return id;
    },
  });

  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date);
    setActiveWorkout(null);
    setError(null);
  }, []);

  const startWorkout = useCallback(async () => {
    setError(null);
    try {
      const workout = await createMutation.mutateAsync({ date: selectedDate });
      setActiveWorkout(workout);
      // Actualizar cache en background
      qc.setQueryData(['workout', 'active', selectedDate], workout);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear el entrenamiento';
      setError(msg);
      throw err;
    }
  }, [selectedDate, createMutation, qc]);

  const finishWorkout = useCallback(async () => {
    if (!activeWorkout?.id) {
      setError('No hay entrenamiento activo');
      return;
    }
    setError(null);
    try {
      const workout = await finishMutation.mutateAsync({ id: activeWorkout.id });
      setActiveWorkout(workout);
      setLastCompletedWorkout(workout);
      qc.setQueryData(['workout', 'active', selectedDate], workout);
      qc.invalidateQueries({ queryKey: ['workouts'] });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al finalizar';
      setError(msg);
      throw err;
    }
  }, [activeWorkout, finishMutation, qc, selectedDate]);

  const cancelWorkout = useCallback(async () => {
    if (!activeWorkout?.id) {
      setError('No hay entrenamiento activo');
      return;
    }
    if (!confirm('¿Cancelar este entrenamiento? No se guardará nada.')) return;
    
    setError(null);
    try {
      await cancelMutation.mutateAsync(activeWorkout.id);
      setActiveWorkout(null);
      qc.setQueryData(['workout', 'active', selectedDate], null);
      qc.invalidateQueries({ queryKey: ['workouts'] });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al cancelar';
      setError(msg);
      throw err;
    }
  }, [activeWorkout, cancelMutation, qc, selectedDate]);

  const refreshWorkout = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['workout', 'active', selectedDate] });
  }, [qc, selectedDate]);

  const resetWorkout = useCallback(() => {
    setActiveWorkout(null);
    setError(null);
    qc.invalidateQueries({ queryKey: ['workout', 'active', selectedDate] });
  }, [qc, selectedDate]);

  const clearLastCompleted = useCallback(() => {
    setLastCompletedWorkout(null);
  }, []);

  return {
    selectedDate,
    activeWorkout,
    lastCompletedWorkout,
    isLoading,
    error,
    setSelectedDate,
    startWorkout,
    finishWorkout,
    cancelWorkout,
    clearLastCompleted,
    resetWorkout,
    refreshWorkout,
    isStarting: createMutation.isPending,
    isFinishing: finishMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
