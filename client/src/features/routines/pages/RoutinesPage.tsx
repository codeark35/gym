import { useState } from 'react';
import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import {
  useRoutines,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
  useToggleRoutine,
} from '../hooks/useRoutines';
import { MUSCLE_GROUP_LABELS, type MuscleGroup } from '../../../types/workout.types';
import type { Routine } from '../../../types/routine.types';
import {
  Plus, Trash2, Edit3, Check, X, Dumbbell,
} from 'lucide-react';
import ExercisePicker from '../../exercises/components/ExercisePicker';
import type { Exercise } from '../../../types/workout.types';

export default function RoutinesPage() {
  const [page] = useState(1);
  const { data, isLoading } = useRoutines(page, 50);
  const createRoutine = useCreateRoutine();
  const updateRoutine = useUpdateRoutine();
  const deleteRoutine = useDeleteRoutine();
  const toggleRoutine = useToggleRoutine();

  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [routineExercises, setRoutineExercises] = useState<
    { exercise: Exercise; targetSets: number; targetReps: number; targetWeightKg?: number; notes?: string }[]
  >([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const routines = data?.data ?? [];

  const resetForm = () => {
    setRoutineName('');
    setRoutineDescription('');
    setRoutineExercises([]);
    setEditingRoutine(null);
    setShowForm(false);
    setFormError(null);
  };

  const startEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setRoutineName(routine.name);
    setRoutineDescription(routine.description ?? '');
    setRoutineExercises(
      routine.exercises.map((re) => ({
        exercise: re.exercise,
        targetSets: re.targetSets,
        targetReps: re.targetReps,
        targetWeightKg: re.targetWeightKg,
        notes: re.notes,
      })),
    );
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!routineName.trim()) {
      setFormError('El nombre de la rutina es obligatorio');
      return;
    }
    if (routineExercises.length === 0) {
      setFormError('Agregá al menos un ejercicio');
      return;
    }

    setFormError(null);

    try {
      if (editingRoutine) {
        await updateRoutine.mutateAsync({
          id: editingRoutine.id,
          data: {
            name: routineName.trim(),
            description: routineDescription.trim() || undefined,
            exercises: routineExercises.map((re) => ({
              exerciseId: re.exercise.id,
              targetSets: re.targetSets,
              targetReps: re.targetReps,
              targetWeightKg: re.targetWeightKg,
              notes: re.notes,
            })),
          },
        });
      } else {
        await createRoutine.mutateAsync({
          name: routineName.trim(),
          description: routineDescription.trim() || undefined,
          exercises: routineExercises.map((re) => ({
            exerciseId: re.exercise.id,
            targetSets: re.targetSets,
            targetReps: re.targetReps,
            targetWeightKg: re.targetWeightKg,
            notes: re.notes,
          })),
        });
      }
      resetForm();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Error al guardar la rutina');
    }
  };

  const removeExercise = (index: number) => {
    setRoutineExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExerciseField = (
    index: number,
    field: 'targetSets' | 'targetReps' | 'targetWeightKg' | 'notes',
    value: any,
  ) => {
    setRoutineExercises((prev) =>
      prev.map((re, i) => (i === index ? { ...re, [field]: value } : re)),
    );
  };

  return (
    <AppShell>
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #3b82f6, #1d4ed8)', borderRadius: 2 }} />
            <h5 className="fw-bold text-white mb-0">Rutinas</h5>
          </div>
          {!showForm && (
            <button
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ background: '#3b82f6', color: '#fff', borderRadius: 8 }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              Nueva
            </button>
          )}
        </div>
        <p className="text-white-50 small mb-0">
          Guardá tus rutinas para iniciar entrenamientos más rápido
        </p>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div
          className="card mb-4"
          style={{
            border: 'none',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
            borderLeft: '3px solid #3b82f6',
          }}
        >
          <div className="card-body p-3">
            <h6 className="fw-bold text-white mb-3">
              {editingRoutine ? 'Editar rutina' : 'Nueva rutina'}
            </h6>

            {formError && (
              <div className="alert alert-danger py-2 small">{formError}</div>
            )}

            <div className="mb-3">
              <label className="form-label small text-white-50">Nombre</label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Ej: Día A - Push"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small text-white-50">Descripción (opcional)</label>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Ej: Enfocado en pecho y tríceps"
                value={routineDescription}
                onChange={(e) => setRoutineDescription(e.target.value)}
              />
            </div>

            {/* Exercise list */}
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="form-label small text-white-50 mb-0">
                  Ejercicios {routineExercises.length > 0 && (
                    <span className="text-white-50">({routineExercises.length})</span>
                  )}
                </label>
                <button
                  className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
                  onClick={() => setShowExercisePicker(true)}
                  style={{ borderRadius: 8, fontSize: '0.75rem' }}
                >
                  <Plus size={14} />
                  Agregar
                </button>
              </div>

              {routineExercises.length === 0 ? (
                <button
                  className="btn btn-outline-secondary w-100 py-3 d-flex flex-column align-items-center gap-1"
                  onClick={() => setShowExercisePicker(true)}
                  style={{ borderRadius: 12, borderStyle: 'dashed' }}
                >
                  <Dumbbell size={24} className="text-white-50" />
                  <span className="text-white-50 small">Tocá para agregar ejercicios</span>
                </button>
              ) : (
                <div
                  className="d-flex flex-column gap-2"
                  style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 2 }}
                >
                  {routineExercises.map((re, index) => (
                    <div
                      key={index}
                      className="p-3"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 14,
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Header: exercise name + muscle group */}
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <div className="d-flex align-items-start gap-2" style={{ minWidth: 0 }}>
                          {re.exercise.imageUrl ? (
                            <img
                              src={re.exercise.imageUrl}
                              alt={re.exercise.name}
                              className="flex-shrink-0"
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 10,
                                objectFit: 'cover',
                                background: 'rgba(255,255,255,0.05)',
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <div
                              className="flex-shrink-0 d-flex align-items-center justify-content-center"
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 10,
                                background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
                              }}
                            >
                              <span style={{ color: '#fbbf24', fontSize: '1.25rem', fontWeight: 700 }}>
                                {re.exercise.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div className="fw-bold text-white" style={{ fontSize: '0.9375rem' }}>
                              {re.exercise.name}
                            </div>
                            <span
                              className="badge"
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                color: '#94a3b8',
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                                marginTop: 4,
                              }}
                            >
                              {MUSCLE_GROUP_LABELS[re.exercise.muscleGroup as MuscleGroup]}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex gap-1 flex-shrink-0">
                          {/* Reorder buttons */}
                          <button
                            className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                            onClick={() => {
                              if (index === 0) return;
                              const next = [...routineExercises];
                              [next[index - 1], next[index]] = [next[index], next[index - 1]];
                              setRoutineExercises(next);
                            }}
                            disabled={index === 0}
                            style={{ width: 32, height: 32, borderRadius: 8, opacity: index === 0 ? 0.3 : 1 }}
                            title="Mover arriba"
                          >
                            <span className="text-white-50">↑</span>
                          </button>
                          <button
                            className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                            onClick={() => {
                              if (index === routineExercises.length - 1) return;
                              const next = [...routineExercises];
                              [next[index], next[index + 1]] = [next[index + 1], next[index]];
                              setRoutineExercises(next);
                            }}
                            disabled={index === routineExercises.length - 1}
                            style={{ width: 32, height: 32, borderRadius: 8, opacity: index === routineExercises.length - 1 ? 0.3 : 1 }}
                            title="Mover abajo"
                          >
                            <span className="text-white-50">↓</span>
                          </button>
                        </div>
                      </div>

                      {/* Inputs grid — 3 columns on mobile */}
                      <div className="row g-2 mb-2">
                        <div className="col-4">
                          <label className="form-label text-white-50" style={{ fontSize: '0.6875rem', marginBottom: 2 }}>
                            Series
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            className="form-control text-center bg-dark text-white border-secondary"
                            style={{ fontSize: '0.9375rem', height: 44, fontWeight: 600 }}
                            value={re.targetSets}
                            onChange={(e) => updateExerciseField(index, 'targetSets', parseInt(e.target.value) || 1)}
                            min={1}
                            max={20}
                          />
                        </div>
                        <div className="col-4">
                          <label className="form-label text-white-50" style={{ fontSize: '0.6875rem', marginBottom: 2 }}>
                            Reps
                          </label>
                          <input
                            type="number"
                            inputMode="numeric"
                            className="form-control text-center bg-dark text-white border-secondary"
                            style={{ fontSize: '0.9375rem', height: 44, fontWeight: 600 }}
                            value={re.targetReps}
                            onChange={(e) => updateExerciseField(index, 'targetReps', parseInt(e.target.value) || 1)}
                            min={1}
                            max={100}
                          />
                        </div>
                        <div className="col-4">
                          <label className="form-label text-white-50" style={{ fontSize: '0.6875rem', marginBottom: 2 }}>
                            Peso (kg)
                          </label>
                          <input
                            type="number"
                            inputMode="decimal"
                            className="form-control text-center bg-dark text-white border-secondary"
                            style={{ fontSize: '0.9375rem', height: 44, fontWeight: 600 }}
                            value={re.targetWeightKg ?? ''}
                            onChange={(e) =>
                              updateExerciseField(index, 'targetWeightKg', e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                            placeholder="—"
                            step={0.5}
                            min={0}
                          />
                        </div>
                      </div>

                      {/* Quick weight adjust buttons */}
                      <div className="d-flex gap-2 mb-2">
                        <button
                          className="btn flex-fill"
                          style={{
                            height: 40,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                          onClick={() => {
                            const current = re.targetWeightKg ?? 0;
                            if (current >= 2.5) {
                              updateExerciseField(index, 'targetWeightKg', Math.round((current - 2.5) * 10) / 10);
                            }
                          }}
                        >
                          −2.5 kg
                        </button>
                        <button
                          className="btn flex-fill"
                          style={{
                            height: 40,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                          onClick={() => {
                            const current = re.targetWeightKg ?? 0;
                            updateExerciseField(index, 'targetWeightKg', Math.round((current + 2.5) * 10) / 10);
                          }}
                        >
                          +2.5 kg
                        </button>
                        <button
                          className="btn flex-fill"
                          style={{
                            height: 40,
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                          onClick={() => {
                            const current = re.targetWeightKg ?? 0;
                            updateExerciseField(index, 'targetWeightKg', Math.round((current + 5) * 10) / 10);
                          }}
                        >
                          +5 kg
                        </button>
                      </div>

                      {/* Notes */}
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary mb-2"
                        placeholder="Notas (opcional)"
                        style={{ fontSize: '0.8125rem', height: 36 }}
                        value={re.notes ?? ''}
                        onChange={(e) => updateExerciseField(index, 'notes', e.target.value || undefined)}
                      />

                      {/* Remove button */}
                      <button
                        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-1"
                        style={{ borderRadius: 8, fontSize: '0.8125rem', height: 40, borderWidth: 1 }}
                        onClick={() => removeExercise(index)}
                      >
                        <Trash2 size={14} />
                        Eliminar ejercicio
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm flex-fill"
                style={{ background: '#3b82f6', color: '#fff', borderRadius: 8 }}
                onClick={handleSave}
                disabled={createRoutine.isPending || updateRoutine.isPending}
              >
                {(createRoutine.isPending || updateRoutine.isPending) ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <Check size={14} className="me-1" />
                )}
                {editingRoutine ? 'Guardar cambios' : 'Crear rutina'}
              </button>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={resetForm}
                style={{ borderRadius: 8 }}
              >
                <X size={14} className="me-1" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routines list */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !showForm && routines.length === 0 ? (
        <EmptyState
          title="Sin rutinas"
          description="Creá tu primera rutina para empezar tus entrenamientos más rápido."
        />
      ) : !showForm ? (
        <div className="d-flex flex-column gap-2">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="card card-dark"
              style={{
                border: 'none',
                borderRadius: 16,
                opacity: routine.isActive ? 1 : 0.55,
                borderLeft: `3px solid ${routine.isActive ? '#3b82f6' : '#64748b'}`,
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <div className="fw-semibold text-white" style={{ fontSize: '0.9375rem' }}>
                      {routine.name}
                    </div>
                    {routine.description && (
                      <div className="small text-white-50">{routine.description}</div>
                    )}
                    <div className="small text-white-50 mt-1">
                      {routine.exercises.length} ejercicios
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm p-1"
                      onClick={() => toggleRoutine.mutate(routine.id)}
                      disabled={toggleRoutine.isPending}
                      title={routine.isActive ? 'Desactivar' : 'Activar'}
                      style={{ width: 28, height: 28, borderRadius: 8 }}
                    >
                      <span style={{ color: routine.isActive ? '#34d399' : '#94a3b8', fontSize: '0.75rem' }}>
                        {routine.isActive ? '✓' : '—'}
                      </span>
                    </button>
                    <button
                      className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                      onClick={() => startEdit(routine)}
                      title="Editar"
                      style={{ width: 28, height: 28, borderRadius: 8 }}
                    >
                      <Edit3 size={14} style={{ color: '#3b82f6' }} />
                    </button>
                    <button
                      className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                      onClick={() => {
                        if (confirm('¿Eliminar esta rutina?')) {
                          deleteRoutine.mutate(routine.id);
                        }
                      }}
                      disabled={deleteRoutine.isPending}
                      title="Eliminar"
                      style={{ width: 28, height: 28, borderRadius: 8 }}
                    >
                      <Trash2 size={14} style={{ color: '#dc2626' }} />
                    </button>
                  </div>
                </div>

                {/* Exercise chips */}
                <div className="d-flex flex-wrap gap-1">
                  {routine.exercises.map((re) => (
                    <span
                      key={re.id}
                      className="badge"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: '#94a3b8',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                      }}
                    >
                      {re.exercise.name}
                      <span className="ms-1" style={{ color: '#64748b' }}>
                        {re.targetSets}×{re.targetReps}
                        {re.targetWeightKg ? ` ${re.targetWeightKg}kg` : ''}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div style={{ height: 20 }} />

      <ExercisePicker
        show={showExercisePicker}
        onHide={() => setShowExercisePicker(false)}
        onSelect={(exercise: Exercise) => {
          if (!routineExercises.some((re) => re.exercise.id === exercise.id)) {
            setRoutineExercises((prev) => [
              ...prev,
              { exercise, targetSets: 3, targetReps: 10 },
            ]);
          }
          setShowExercisePicker(false);
        }}
      />
    </AppShell>
  );
}
