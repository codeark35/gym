import { useState } from 'react';
import type { WorkoutSet } from '../../../types/workout.types';
import { useUpdateSet, useDeleteSet } from '../hooks/useWorkouts';
import PRBadge from '../../../components/ui/PRBadge';
import { Trash2, Check, Minus, Plus } from 'lucide-react';

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
  const [error, setError] = useState('');

  const handleComplete = () => {
    setError('');
    updateSet.mutate(
      { workoutId, setId: set.id, reps, weightKg: weight },
      { onSuccess: () => { setCompleted(true); onCompleted?.(); } },
    );
  };

  const handleDelete = () => {
    setError('');
    if (confirm('¿Eliminar esta serie?')) {
      deleteSet.mutate(
        { workoutId, setId: set.id },
        {
          onError: (err: any) => {
            const msg = err?.response?.data?.message ?? err?.message ?? 'Error al eliminar la serie';
            setError(msg);
          },
        },
      );
    }
  };

  const adjustWeight = (delta: number) => {
    const next = Math.max(0, Math.round((weight + delta) * 100) / 100);
    setWeight(next);
  };

  const adjustReps = (delta: number) => {
    const next = Math.max(1, reps + delta);
    setReps(next);
  };

  return (
    <div
      className="mb-2"
      style={{
        borderRadius: 14,
        border: completed ? '2px solid #2d6a4f' : '1px solid rgba(0,0,0,0.06)',
        background: completed ? 'linear-gradient(135deg, #dcfce7, #d1fae5)' : '#ffffff',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top row: Number + Peso + Reps + Actions */}
      <div className="d-flex align-items-center gap-2 p-2">
        {/* Set number badge */}
        <div
          className="d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
          style={{
            width: 36, height: 36,
            background: completed
              ? 'linear-gradient(135deg, #2d6a4f, #34d399)'
              : 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
            borderRadius: 10,
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>

        {/* Weight - compact inline input */}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
              onClick={() => adjustWeight(-2.5)}
              style={{ width: 32, height: 36, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v)) setWeight(v);
              }}
              className="form-control text-center fw-bold"
              style={{
                width: 65, height: 36,
                fontSize: '1rem',
                padding: '0.25rem',
                borderRadius: 8,
                border: '2px solid #e2e8f0',
                background: 'white',
                minWidth: 0,
              }}
            />
            <button
              className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
              onClick={() => adjustWeight(2.5)}
              style={{ width: 32, height: 36, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="text-center" style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: 2 }}>kg</div>
        </div>

        {/* × separator */}
        <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '1rem' }}>×</span>

        {/* Reps - compact inline input */}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
              onClick={() => adjustReps(-1)}
              style={{ width: 32, height: 36, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v)) setReps(v);
              }}
              className="form-control text-center fw-bold"
              style={{
                width: 50, height: 36,
                fontSize: '1rem',
                padding: '0.25rem',
                borderRadius: 8,
                border: '2px solid #e2e8f0',
                background: 'white',
                minWidth: 0,
              }}
            />
            <button
              className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
              onClick={() => adjustReps(1)}
              style={{ width: 32, height: 36, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="text-center" style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: 2 }}>reps</div>
        </div>

        {/* Actions */}
        <div className="d-flex flex-column gap-1 flex-shrink-0">
          <button
            className={`btn btn-sm d-flex align-items-center justify-content-center ${completed ? 'btn-success' : 'btn-outline-success'}`}
            onClick={handleComplete}
            disabled={updateSet.isPending}
            style={{ width: 44, height: 36, borderRadius: 10, padding: 0 }}
            title="Completar"
          >
            <Check size={18} />
          </button>
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center p-0"
            onClick={handleDelete}
            disabled={deleteSet.isPending}
            style={{ width: 44, height: 36, borderRadius: 10 }}
            title="Eliminar"
          >
            {deleteSet.isPending ? (
              <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      {/* PR badge + error */}
      <div className="d-flex align-items-center gap-2 px-2 pb-2">
        {set.isPR && <PRBadge animate />}
        {error && (
          <span className="badge text-white small" style={{ background: '#991b1b' }}>{error}</span>
        )}
      </div>
    </div>
  );
}
