import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import type { Workout } from '../../../types/workout.types';
import { todayISO } from '../../../utils/date.utils';

const STORAGE_KEY = 'gymtracker_active_workout_id';

function loadStoredId(): string | null {
  try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function saveStoredId(id: string | null) {
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* noop */ }
}

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
  startWorkoutFromRoutine: (routineId: string) => Promise<void>;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  clearLastCompleted: () => void;
  resetWorkout: () => void;
  refreshWorkout: () => void;
  isStarting: boolean;
  isFinishing: boolean;
  isCancelling: boolean;
}

export function useActiveWorkout(): UseActiveWorkoutReturn {
  const qc = useQueryClient();
  const [selectedDate, setSelectedDateState] = useState(todayISO());
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [lastCompletedWorkout, setLastCompletedWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storedWorkoutId, setStoredWorkoutId] = useState<string | null>(() => loadStoredId());

  // By-ID query — preferred, NOT invalidated by set mutations
  const byIdQuery = useQuery<Workout | null>({
    queryKey: ['workout', 'by-id', storedWorkoutId],
    queryFn: async () => {
      if (!storedWorkoutId) return null;
      const res = await api.get<{ data: Workout }>(`/workouts/${storedWorkoutId}`);
      return (res.data.data ?? res.data) as unknown as Workout;
    },
    enabled: !!storedWorkoutId,
    staleTime: 30_000,
    retry: 1,
  });

  // Date-based query — fallback when no stored ID
  const dateQuery = useQuery<Workout | null>({
    queryKey: ['workout', 'active', selectedDate],
    queryFn: async () => {
      if (selectedDate === todayISO()) {
        const res = await api.get<{ data: Workout | null }>(`/workouts/today?date=${selectedDate}`);
        return res.data.data ?? null;
      }
      const res = await api.get<{ data: Workout[] }>(`/workouts/date/${selectedDate}`);
      const workouts = res.data.data ?? [];
      return workouts.find((w: Workout) => w.status === 'IN_PROGRESS') ?? null;
    },
    enabled: !storedWorkoutId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    placeholderData: (prev: Workout | null | undefined) => prev,
  });

  const queryWorkout = storedWorkoutId ? byIdQuery.data : dateQuery.data;
  const isLoadingQuery = storedWorkoutId ? byIdQuery.isLoading : dateQuery.isLoading;

  // Sync query result to local state; clear stored ID if workout gone
  useEffect(() => {
    if (queryWorkout !== undefined) {
      setActiveWorkout(queryWorkout);
      if (!queryWorkout && storedWorkoutId) {
        setStoredWorkoutId(null);
        saveStoredId(null);
      }
    }
  }, [queryWorkout, storedWorkoutId]);

  // isLoading only true if loading AND no workout yet
  const isLoading = isLoadingQuery && activeWorkout === null;

  // ─── Mutations ───────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (data: { date: string }) => {
      const res = await api.post<{ data: Workout }>('/workouts', data);
      return (res.data.data ?? res.data) as unknown as Workout;
    },
  });

  const createFromRoutineMutation = useMutation({
    mutationFn: async (data: { routineId: string; date: string }) => {
      const res = await api.post<{ data: Workout }>(
        `/workouts/from-routine/${data.routineId}`,
        { date: data.date },
      );
      return (res.data.data ?? res.data) as unknown as Workout;
    },
  });

  const finishMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await api.patch<{ data: Workout }>(`/workouts/${id}`, { status: 'COMPLETED' });
      return (res.data.data ?? res.data) as unknown as Workout;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/workouts/${id}`);
      return id;
    },
  });

  // ─── Actions ─────────────────────────────────────────────

  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date);
    setActiveWorkout(null);
    setError(null);
    setStoredWorkoutId(null);
    saveStoredId(null);
  }, []);

  const startWorkout = useCallback(async () => {
    setError(null);
    try {
      const workout = await createMutation.mutateAsync({ date: selectedDate });
      setActiveWorkout(workout);
      setStoredWorkoutId(workout.id);
      saveStoredId(workout.id);
      qc.setQueryData(['workout', 'active', selectedDate], workout);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al crear el entrenamiento';
      setError(msg);
      throw err;
    }
  }, [selectedDate, createMutation, qc]);

  const startWorkoutFromRoutine = useCallback(async (routineId: string) => {
    setError(null);
    try {
      const workout = await createFromRoutineMutation.mutateAsync({ routineId, date: selectedDate });
      setActiveWorkout(workout);
      setStoredWorkoutId(workout.id);
      saveStoredId(workout.id);
      qc.setQueryData(['workout', 'active', selectedDate], workout);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al iniciar rutina';
      setError(msg);
      throw err;
    }
  }, [selectedDate, createFromRoutineMutation, qc]);

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
      setStoredWorkoutId(null);
      saveStoredId(null);
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

    setError(null);
    try {
      await cancelMutation.mutateAsync(activeWorkout.id);
      setActiveWorkout(null);
      setStoredWorkoutId(null);
      saveStoredId(null);
      qc.setQueryData(['workout', 'active', selectedDate], null);
      qc.invalidateQueries({ queryKey: ['workouts'] });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al cancelar';
      setError(msg);
      throw err;
    }
  }, [activeWorkout, cancelMutation, qc, selectedDate]);

  const refreshWorkout = useCallback(() => {
    if (storedWorkoutId) {
      qc.invalidateQueries({ queryKey: ['workout', 'by-id', storedWorkoutId] });
    } else {
      qc.invalidateQueries({ queryKey: ['workout', 'active', selectedDate] });
    }
  }, [qc, selectedDate, storedWorkoutId]);

  const resetWorkout = useCallback(() => {
    setActiveWorkout(null);
    setError(null);
    setStoredWorkoutId(null);
    saveStoredId(null);
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
    startWorkoutFromRoutine,
    finishWorkout,
    cancelWorkout,
    clearLastCompleted,
    resetWorkout,
    refreshWorkout,
    isStarting: createMutation.isPending || createFromRoutineMutation.isPending,
    isFinishing: finishMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
