import { useState, useRef, useEffect } from 'react';
import { WorkoutSet } from '../../../types/workout.types';
import { useUpdateSet, useDeleteSet } from '../hooks/useWorkouts';
import PRBadge from '../../../components/ui/PRBadge';
import NumberInput from '../../../components/forms/NumberInput';
import { Trash2, Check } from 'lucide-react';

interface SetRowProps {
  set: WorkoutSet;
  workoutId: string;
  index: number;
  onCompleted?: () => void;
}

export default function SetRow({ set, workoutId, index, onCompleted }: SetRowProps) {
  const updateSet = useUpdateSet();
  const deleteSet = useDeleteSet();
  const [reps, setReps] = useState(set.reps);
  const [weight, setWeight] = useState(set.weightKg);
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    updateSet.mutate(
      { workoutId, setId: set.id, reps, weightKg: weight },
      { onSuccess: () => { setCompleted(true); onCompleted?.(); } },
    );
  };

  const handleDelete = () => {
    if (confirm('¿Eliminar esta serie?')) {
      deleteSet.mutate({ workoutId, setId: set.id });
    }
  };

  return (
    <div
      className={`set-row d-flex align-items-center gap-2 p-2 rounded mb-1 ${completed ? 'bg-success bg-opacity-10' : 'bg-white'} border`}
    >
      <span className="set-number">{index + 1}</span>

      <NumberInput
        value={weight}
        onChange={setWeight}
        step={2.5}
        min={0}
        unit="kg"
        className="flex-shrink-0"
      />

      <span className="text-muted">×</span>

      <NumberInput
        value={reps}
        onChange={setReps}
        step={1}
        min={1}
        unit="reps"
        className="flex-shrink-0"
      />

      {set.isPR && <PRBadge animate />}

      <div className="ms-auto d-flex gap-1">
        <button
          className={`btn btn-sm ${completed ? 'btn-success' : 'btn-outline-success'}`}
          onClick={handleComplete}
          disabled={updateSet.isPending}
          style={{ minWidth: 44, minHeight: 44 }}
          title="Completar serie"
        >
          <Check size={16} />
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={handleDelete}
          disabled={deleteSet.isPending}
          style={{ minWidth: 44, minHeight: 44 }}
          title="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
