import { useState } from 'react';
import { Workout, Exercise } from '../../../types/workout.types';
import { useTodayWorkout, useCreateWorkout, useUpdateWorkout } from '../hooks/useWorkouts';
import ExerciseCard from './ExerciseCard';
import ExercisePicker from '../../exercises/components/ExercisePicker';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatDateFull, todayISO } from '../../../utils/date.utils';
import { totalVolume, formatVolume } from '../../../utils/volume.utils';
import { Plus, CheckCircle2, Dumbbell } from 'lucide-react';

export default function WorkoutLogger() {
  const { data: workout, isLoading } = useTodayWorkout();
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  if (isLoading) return <LoadingSpinner />;

  const handleStartWorkout = () => {
    createWorkout.mutate({ date: todayISO() });
  };

  const handleFinish = () => {
    if (workout) {
      updateWorkout.mutate({ id: workout.id, status: 'COMPLETED' });
    }
  };

  const handleExercisePicked = (exercise: Exercise) => {
    if (!selectedExercises.includes(exercise.id)) {
      setSelectedExercises((prev) => [...prev, exercise.id]);
    }
    setShowPicker(false);
  };

  if (!workout) {
    return (
      <div className="text-center py-5">
        <Dumbbell size={56} className="text-secondary mb-3" />
        <h5 className="fw-semibold">No hay entrenamiento hoy</h5>
        <p className="text-muted small">¿Listo para entrenar?</p>
        <button
          className="btn btn-primary btn-lg btn-action px-5"
          onClick={handleStartWorkout}
          disabled={createWorkout.isPending}
        >
          {createWorkout.isPending ? (
            <span className="spinner-border spinner-border-sm me-2" />
          ) : null}
          Iniciar entrenamiento
        </button>
      </div>
    );
  }

  // Group sets by exercise
  const exerciseMap = new Map<string, { exercise: Exercise; sets: typeof workout.sets }>();
  for (const set of workout.sets) {
    if (!exerciseMap.has(set.exerciseId)) {
      exerciseMap.set(set.exerciseId, { exercise: set.exercise, sets: [] });
    }
    exerciseMap.get(set.exerciseId)!.sets.push(set);
  }

  // Also add exercises picked but with no sets yet
  for (const exId of selectedExercises) {
    if (!exerciseMap.has(exId)) {
      // We need exercise data — rely on what was passed via picker
    }
  }

  const allSets = workout.sets;
  const vol = totalVolume(allSets.map((s) => ({ reps: s.reps, weightKg: s.weightKg, isWarmup: s.isWarmup })));

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="fw-bold mb-0">{workout.name ?? 'Entrenamiento de hoy'}</h5>
          <small className="text-muted">{formatDateFull(workout.date)}</small>
        </div>
        <div className="text-end">
          <div className="small text-muted">Volumen</div>
          <div className="fw-bold">{formatVolume(vol)}</div>
        </div>
      </div>

      {Array.from(exerciseMap.values()).map(({ exercise, sets }) => (
        <ExerciseCard
          key={exercise.id}
          exerciseId={exercise.id}
          exercise={exercise}
          sets={sets}
          workoutId={workout.id}
        />
      ))}

      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-outline-primary flex-fill btn-action"
          onClick={() => setShowPicker(true)}
        >
          <Plus size={18} className="me-1" />
          Agregar ejercicio
        </button>
        {workout.status === 'IN_PROGRESS' && (
          <button
            className="btn btn-success btn-action"
            onClick={handleFinish}
            disabled={updateWorkout.isPending}
          >
            <CheckCircle2 size={18} className="me-1" />
            Finalizar
          </button>
        )}
      </div>

      <ExercisePicker
        show={showPicker}
        onHide={() => setShowPicker(false)}
        onSelect={handleExercisePicked}
      />
    </div>
  );
}
