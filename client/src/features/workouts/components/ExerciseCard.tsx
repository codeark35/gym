import { useState, useEffect, useRef } from 'react';
import { Exercise, WorkoutSet, MUSCLE_GROUP_LABELS, MuscleGroup } from '../../../types/workout.types';
import { useAddSet } from '../hooks/useWorkouts';
import SetRow from './SetRow';
import ExercisePicker from '../../exercises/components/ExercisePicker';
import NumberInput from '../../../components/forms/NumberInput';
import { Plus, Timer, CheckCircle2 } from 'lucide-react';

interface ExerciseCardProps {
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  workoutId: string;
}

function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  const pct = (remaining / seconds) * 100;
  return (
    <div className="text-center py-2">
      <div className="rest-timer text-primary">{remaining}s</div>
      <div className="progress" style={{ height: 4 }}>
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <button className="btn btn-sm btn-outline-secondary mt-2" onClick={onDone}>Saltear</button>
    </div>
  );
}

export default function ExerciseCard({ exerciseId, exercise, sets, workoutId }: ExerciseCardProps) {
  const addSet = useAddSet();
  const [weight, setWeight] = useState(sets.length ? sets[sets.length - 1].weightKg : 0);
  const [reps, setReps] = useState(sets.length ? sets[sets.length - 1].reps : 10);
  const [restTime, setRestTime] = useState(90);
  const [showTimer, setShowTimer] = useState(false);

  const handleAddSet = () => {
    const setNumber = sets.length + 1;
    addSet.mutate({ workoutId, exerciseId, setNumber, reps, weightKg: weight });
    setShowTimer(true);
  };

  return (
    <div className="card mb-3">
      <div className="card-header d-flex align-items-center justify-content-between py-2">
        <div>
          <span className="fw-semibold">{exercise.nameEs ?? exercise.name}</span>
          <span className="badge bg-secondary ms-2 fw-normal" style={{ fontSize: '0.65rem' }}>
            {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup]}
          </span>
        </div>
        <select
          className="form-select form-select-sm w-auto"
          value={restTime}
          onChange={(e) => setRestTime(Number(e.target.value))}
          title="Tiempo de descanso"
        >
          <option value={60}>60s</option>
          <option value={90}>90s</option>
          <option value={120}>120s</option>
          <option value={180}>180s</option>
        </select>
      </div>
      <div className="card-body p-2">
        {sets.map((s, i) => (
          <SetRow key={s.id} set={s} workoutId={workoutId} index={i} />
        ))}

        {showTimer && (
          <RestTimer seconds={restTime} onDone={() => setShowTimer(false)} />
        )}

        {/* Quick add row */}
        <div className="d-flex align-items-end gap-2 mt-2 pt-2 border-top">
          <NumberInput value={weight} onChange={setWeight} step={2.5} min={0} label="Peso" unit="kg" />
          <NumberInput value={reps} onChange={setReps} step={1} min={1} label="Reps" />
          <button
            className="btn btn-primary btn-action flex-shrink-0"
            onClick={handleAddSet}
            disabled={addSet.isPending}
            style={{ minHeight: 52 }}
          >
            <Plus size={18} />
            <span className="d-none d-sm-inline ms-1">Serie</span>
          </button>
        </div>
      </div>
    </div>
  );
}
