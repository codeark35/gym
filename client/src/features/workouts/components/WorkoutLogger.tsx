import { useNavigate } from 'react-router-dom';
import type { Exercise } from '../../../types/workout.types';

import { useActiveWorkout } from '../hooks/useActiveWorkout';
import ExerciseCard from './ExerciseCard';
import ExercisePicker from '../../exercises/components/ExercisePicker';
import WorkoutSummary from './WorkoutSummary';
import RoutinePicker from '../../routines/components/RoutinePicker';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatDateFull, todayISO } from '../../../utils/date.utils';
import { totalVolume, formatVolume } from '../../../utils/volume.utils';
import { useState, useEffect } from 'react';
import {
  Plus, CheckCircle2, Dumbbell, CalendarDays, Zap, AlertTriangle
} from 'lucide-react';

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const {
    selectedDate,
    activeWorkout: workout,
    lastCompletedWorkout,
    isLoading,
    error,
    setSelectedDate,
    startWorkout,
    startWorkoutFromRoutine,
    finishWorkout,
    cancelWorkout,
    isStarting,
    isFinishing,
  } = useActiveWorkout();

  const [showRoutinePicker, setShowRoutinePicker] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [exerciseOrder, setExerciseOrder] = useState<string[]>([]);

  // Reset local state when workout changes (new session)
  useEffect(() => {
    if (workout?.id) {
      setExerciseOrder([]);
      setActiveExerciseId(null);
      setSelectedExercises([]);
    }
  }, [workout?.id]);

  // Keep fixed insertion order: only append new IDs, never reorder
  useEffect(() => {
    if (!workout) return;
    setExerciseOrder((prev) => {
      const next = [...prev];
      const seen = new Set(next);
      for (const s of workout.sets ?? []) {
        if (!seen.has(s.exerciseId)) {
          seen.add(s.exerciseId);
          next.push(s.exerciseId);
        }
      }
      for (const ex of selectedExercises) {
        if (!seen.has(ex.id)) {
          seen.add(ex.id);
          next.push(ex.id);
        }
      }
      return next;
    });
  }, [workout, selectedExercises]);

  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <LoadingSpinner />
        <p className="text-white-50 small mt-3">Cargando sesión...</p>
      </div>
    );
  }

  // Show summary when explicitly requested (after finishing or viewing completed)
  if (showSummary && (workout || lastCompletedWorkout)) {
    const summaryWorkout = workout?.status === 'COMPLETED' ? workout : lastCompletedWorkout;
    return (
      <WorkoutSummary
        date={selectedDate}
        workout={summaryWorkout}
        onClose={() => {
          setShowSummary(false);
          navigate('/');
        }}
        onNewWorkout={() => {
          setShowSummary(false);
        }}
      />
    );
  }

  // If no active workout OR workout is completed, show start screen with routine picker option
  if (!workout || workout.status === 'COMPLETED') {
    return (
      <div className="fade-in">
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #f59e0b, #fbbf24)', borderRadius: 2 }} />
            <h5 className="fw-bold text-white mb-0">Entrenamiento</h5>
          </div>
          <p className="text-white-50 small mb-0">
            {selectedDate === todayISO() ? 'Hoy' : formatDateFull(selectedDate)}
          </p>
        </div>

        <div className="text-center py-4">
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
              boxShadow: '0 8px 20px rgba(30, 58, 95, 0.4)',
            }}
          >
            <Dumbbell size={32} className="text-white" />
          </div>
          <h5 className="fw-semibold text-white mb-2">
            {selectedDate === todayISO() ? '¿Listo para entrenar?' : 'Registrar entrenamiento'}
          </h5>
          <p className="text-white-50 small">
            Seleccioná la fecha y elegí cómo querés entrenar
          </p>

          <div className="mb-3">
            <div className="input-group mx-auto" style={{ maxWidth: 280 }}>
              <span className="input-group-text bg-dark border-secondary">
                <CalendarDays size={16} className="text-white-50" />
              </span>
              <input
                type="date"
                className="form-control bg-dark text-white border-secondary"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={todayISO()}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center justify-content-center gap-2">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Show completed workout summary if available */}
          {lastCompletedWorkout && (
            <div className="mb-3">
              <div
                className="card p-3 mb-3"
                style={{ borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, rgba(45, 106, 79, 0.15), rgba(45, 106, 79, 0.05))' }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <CheckCircle2 size={16} style={{ color: '#2d6a4f' }} />
                  <span className="fw-bold text-white small">Entrenamiento completado hoy</span>
                </div>
                <div className="d-flex align-items-center gap-3 small text-white-50">
                  <span>{lastCompletedWorkout.sets?.length ?? 0} series</span>
                  <span>{formatVolume(lastCompletedWorkout.sets?.reduce((sum, s) => sum + (s.volume ?? 0), 0) ?? 0)}</span>
                </div>
                <button
                  className="btn btn-sm btn-outline-light mt-2 w-100"
                  onClick={() => setShowSummary(true)}
                  style={{ borderRadius: 8, fontSize: '0.875rem' }}
                >
                  Ver resumen
                </button>
              </div>
            </div>
          )}

          <button
            className="btn btn-warning btn-lg btn-action px-5 mt-2"
            onClick={() => setShowRoutinePicker(true)}
          >
            <Zap size={18} className="me-2" />
            {selectedDate === todayISO() ? 'Iniciar entrenamiento' : 'Registrar entrenamiento'}
          </button>
        </div>

        <RoutinePicker
          show={showRoutinePicker}
          onHide={() => setShowRoutinePicker(false)}
          selectedDate={selectedDate}
          onStartFree={startWorkout}
          onStartRoutine={startWorkoutFromRoutine}
          isStarting={isStarting}
        />
      </div>
    );
  }

  // Active workout view
  // Group sets by exercise
  const exerciseMap = new Map<string, { exercise: Exercise; sets: typeof workout.sets }>();
  for (const s of (workout.sets ?? [])) {
    if (!exerciseMap.has(s.exerciseId)) {
      exerciseMap.set(s.exerciseId, { exercise: s.exercise, sets: [] });
    }
    exerciseMap.get(s.exerciseId)!.sets.push(s);
  }

  for (const ex of selectedExercises) {
    if (!exerciseMap.has(ex.id)) {
      exerciseMap.set(ex.id, { exercise: ex, sets: [] });
    }
  }

  const allSets = workout.sets ?? [];
  const vol = totalVolume(allSets.map((s: { reps: number; weightKg: number; isWarmup: boolean }) => ({ reps: s.reps, weightKg: s.weightKg, isWarmup: s.isWarmup })));

  return (
    <div className="fade-in">
      {/* Sticky header for active workout */}
      <div className="sticky-top" style={{ top: 0, zIndex: 100, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', margin: '-1rem -1rem 1rem -1rem', padding: '0.75rem 1rem' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <div style={{ width: 4, height: 16, background: 'linear-gradient(to bottom, #f59e0b, #fbbf24)', borderRadius: 2 }} />
              <h5 className="fw-bold text-white mb-0" style={{ fontSize: '1.125rem' }}>{workout.name ?? 'Entrenamiento'}</h5>
            </div>
            <small className="text-white-50">{formatDateFull(workout.date)}</small>
          </div>
          <div className="text-end">
            <div className="small text-white-50">Volumen</div>
            <div className="fw-bold" style={{ color: '#fbbf24', fontSize: '1.125rem' }}>{formatVolume(vol)}</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 mt-1">
          <span className="small" style={{ color: '#64748b' }}>
            {exerciseMap.size} ejercicios · {allSets.length} series
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* Exercise cards — fixed order accordion */}
      {exerciseOrder.map((exId) => {
        const entry = exerciseMap.get(exId);
        if (!entry) return null;
        return (
          <ExerciseCard
            key={exId}
            exerciseId={exId}
            exercise={entry.exercise}
            sets={entry.sets}
            workoutId={workout.id}
            isExpanded={activeExerciseId === exId}
            onToggle={() => setActiveExerciseId((prev) => prev === exId ? null : exId)}
          />
        );
      })}

      {/* Action buttons */}
      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-outline-light flex-fill btn-action d-flex align-items-center justify-content-center"
          onClick={() => setShowPicker(true)}
        >
          <Plus size={18} className="me-1" />
          Agregar ejercicio
        </button>
        {workout.status === 'IN_PROGRESS' && (
          <button
            className={`btn btn-action ${allSets.length === 0 ? 'btn-outline-secondary' : 'btn-success'}`}
            onClick={async () => {
              await finishWorkout();
              setShowSummary(true);
            }}
            disabled={isFinishing}
            style={{ minWidth: 120 }}
          >
            {isFinishing ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : (
              <CheckCircle2 size={18} className="me-1" />
            )}
            Finalizar
          </button>
        )}
      </div>

      {/* Cancel workout */}
      {workout.status === 'IN_PROGRESS' && (
        <div className="mt-2">
          <button
            className="btn btn-outline-danger w-100 btn-action"
            onClick={cancelWorkout}
          >
            Cancelar entrenamiento
          </button>
          <p className="small text-white-50 text-center mt-2 mb-0">
            Si no vas a registrar nada, podés cancelarlo y no se guardará.
          </p>
        </div>
      )}

      {/* Spacer for bottom */}
      <div style={{ height: 20 }} />

      <ExercisePicker
        show={showPicker}
        onHide={() => setShowPicker(false)}
        onSelect={(exercise: Exercise) => {
          if (!selectedExercises.some((e) => e.id === exercise.id)) {
            setSelectedExercises((prev) => [...prev, exercise]);
            setExerciseOrder((prev) => [...prev, exercise.id]);
            setActiveExerciseId(exercise.id);
          }
          setShowPicker(false);
        }}
      />
    </div>
  );
}
