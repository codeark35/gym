import { useState, useEffect } from 'react';
import type { Exercise, WorkoutSet, MuscleGroup } from '../../../types/workout.types';
import { MUSCLE_GROUP_LABELS } from '../../../types/workout.types';

import { useAddSet } from '../hooks/useWorkouts';
import SetRow from './SetRow';
import { Plus, Timer, Minus, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

interface ExerciseCardProps {
  exerciseId: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  workoutId: string;
}

// Muscle group color mapping
const MUSCLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CHEST: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  BACK: { bg: 'rgba(67, 56, 202, 0.12)', text: '#4338ca', border: 'rgba(67, 56, 202, 0.3)' },
  LEGS: { bg: 'rgba(30, 58, 95, 0.12)', text: '#1e3a5f', border: 'rgba(30, 58, 95, 0.3)' },
  SHOULDERS: { bg: 'rgba(45, 106, 79, 0.12)', text: '#2d6a4f', border: 'rgba(45, 106, 79, 0.3)' },
  BICEPS: { bg: 'rgba(220, 38, 38, 0.12)', text: '#dc2626', border: 'rgba(220, 38, 38, 0.3)' },
  TRICEPS: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  CORE: { bg: 'rgba(236, 72, 153, 0.12)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
  GLUTES: { bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' },
  CALVES: { bg: 'rgba(14, 165, 233, 0.12)', text: '#0ea5e9', border: 'rgba(14, 165, 233, 0.3)' },
  FOREARMS: { bg: 'rgba(100, 116, 139, 0.12)', text: '#64748b', border: 'rgba(100, 116, 139, 0.3)' },
  FULL_BODY: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
};

function getMuscleColor(muscleGroup: MuscleGroup) {
  return MUSCLE_COLORS[muscleGroup] ?? MUSCLE_COLORS.FULL_BODY;
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
    <div className="text-center py-3 my-2 rounded-3 position-relative" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.04))', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
        <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 36, height: 36, background: 'rgba(245, 158, 11, 0.15)' }}>
          <Timer size={18} style={{ color: '#f59e0b' }} />
        </div>
        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', letterSpacing: -2, lineHeight: 1 }}>
          {remaining}
        </span>
        <span className="small fw-medium" style={{ color: '#f59e0b' }}>s</span>
      </div>
      <div className="progress mx-auto" style={{ height: 6, maxWidth: 220, borderRadius: 6, background: 'rgba(0,0,0,0.05)' }}>
        <div
          className="progress-bar"
          style={{
            width: `${pct}%`,
            background: remaining > 10 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #dc2626, #ef4444)',
            borderRadius: 6,
            transition: 'width 1s linear',
          }}
        />
      </div>
      <button className="btn btn-sm btn-link mt-2 fw-medium" style={{ color: '#94a3b8', fontSize: '0.8125rem' }} onClick={onDone}>
        Saltear descanso
      </button>
    </div>
  );
}

export default function ExerciseCard({ exerciseId, exercise, sets, workoutId }: ExerciseCardProps) {
  const addSet = useAddSet();
  const [weight, setWeight] = useState(sets.length ? sets[sets.length - 1].weightKg : 0);
  const [reps, setReps] = useState(sets.length ? sets[sets.length - 1].reps : 10);
  const [restTime, setRestTime] = useState(90);
  const [showTimer, setShowTimer] = useState(false);
  const [showRestSelector, setShowRestSelector] = useState(false);
  // Collapse by default if exercise has sets (completed), keep expanded if empty (active)
  const [isCollapsed, setIsCollapsed] = useState(sets.length > 0);

  const color = getMuscleColor(exercise.muscleGroup as MuscleGroup);
  const totalVol = sets.reduce((sum, s) => sum + (s.volume ?? 0), 0);
  const bestWeight = sets.length > 0 ? Math.max(...sets.map(s => s.weightKg)) : 0;
  const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);

  const handleAddSet = () => {
    const setNumber = sets.length + 1;
    addSet.mutate({ workoutId, exerciseId, setNumber, reps, weightKg: weight });
    setShowTimer(true);
  };

  const adjustWeight = (delta: number) => {
    setWeight((w) => Math.max(0, Math.round((w + delta) * 100) / 100));
  };

  const adjustReps = (delta: number) => {
    setReps((r) => Math.max(1, r + delta));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="card mb-3" style={{ border: 'none', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header - clickable to collapse/expand */}
      <div
        className="card-header d-flex align-items-center justify-content-between py-2 px-3"
        onClick={toggleCollapse}
        style={{
          background: color.bg,
          borderBottom: isCollapsed ? 'none' : `1px solid ${color.border}`,
          borderRadius: isCollapsed ? 16 : '16px 16px 0 0',
          cursor: 'pointer',
        }}
      >
        <div className="d-flex align-items-center gap-2 overflow-hidden">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{ width: 28, height: 28, background: color.text, opacity: 0.9 }}
          >
            <span className="text-white fw-bold" style={{ fontSize: '0.75rem' }}>
              {sets.length}
            </span>
          </div>
          <div className="min-w-0">
            <div className="fw-semibold text-truncate" style={{ color: '#1e293b', fontSize: '0.9375rem' }}>
              {exercise.nameEs ?? exercise.name}
            </div>
            <div className="d-flex align-items-center gap-1">
              <span
                className="badge fw-medium"
                style={{
                  fontSize: '0.6rem',
                  background: color.bg,
                  color: color.text,
                  border: `1px solid ${color.border}`,
                }}
              >
                {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup]}
              </span>
              {totalVol > 0 && (
                <span className="small" style={{ color: color.text, fontSize: '0.65rem' }}>
                  {totalVol.toLocaleString()} kg
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Collapse/expand button */}
          <button
            className="btn btn-sm d-flex align-items-center justify-content-center"
            onClick={(e) => { e.stopPropagation(); toggleCollapse(); }}
            style={{
              borderRadius: 8,
              background: 'rgba(255,255,255,0.5)',
              border: `1px solid ${color.border}`,
              color: color.text,
              width: 32,
              height: 32,
              padding: 0,
            }}
          >
            {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>

          {/* Rest time selector */}
          {!isCollapsed && (
            <div className="position-relative">
              <button
                className="btn btn-sm d-flex align-items-center gap-1"
                onClick={(e) => { e.stopPropagation(); setShowRestSelector(!showRestSelector); }}
                style={{
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.5)',
                  border: `1px solid ${color.border}`,
                  color: color.text,
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                }}
              >
                <Timer size={12} />
                {restTime}s
                <ChevronDown size={12} />
              </button>
              {showRestSelector && (
                <div className="position-absolute end-0 mt-1" style={{ zIndex: 10, minWidth: 100 }}>
                  <div className="card" style={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    {[60, 90, 120, 180].map((t) => (
                      <button
                        key={t}
                        className="btn btn-sm text-start"
                        onClick={(e) => { e.stopPropagation(); setRestTime(t); setShowRestSelector(false); }}
                        style={{
                          background: restTime === t ? color.bg : 'white',
                          color: restTime === t ? color.text : '#1e293b',
                          borderRadius: 0,
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapsed summary */}
      {isCollapsed && sets.length > 0 && (
        <div className="card-body py-2 px-3">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1">
              <span className="fw-bold" style={{ color: color.text, fontSize: '0.875rem' }}>
                {sets.length}
              </span>
              <span className="small" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>series</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span className="fw-bold" style={{ color: color.text, fontSize: '0.875rem' }}>
                {bestWeight > 0 ? bestWeight.toFixed(1) : '-'}
              </span>
              <span className="small" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>kg max</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span className="fw-bold" style={{ color: color.text, fontSize: '0.875rem' }}>
                {totalVol.toLocaleString()}
              </span>
              <span className="small" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>kg vol</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span className="fw-bold" style={{ color: color.text, fontSize: '0.875rem' }}>
                {totalReps}
              </span>
              <span className="small" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>reps</span>
            </div>
          </div>
          <div className="mt-1">
            <span className="small" style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>
              Tocá para expandir y ver detalles
            </span>
          </div>
        </div>
      )}

      {/* Expanded content */}
      {!isCollapsed && (
        <div className="card-body p-2">
        {/* Sets list */}
        {sets.map((s, i) => (
          <SetRow key={s.id} set={s} workoutId={workoutId} index={i} />
        ))}

        {/* Rest timer */}
        {showTimer && (
          <RestTimer seconds={restTime} onDone={() => setShowTimer(false)} />
        )}

        {/* Quick add - mobile optimized */}
        <div
          className="mt-2 pt-2"
          style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}
        >
          {/* Inputs row */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                  onClick={() => adjustWeight(-2.5)}
                  style={{ width: 36, height: 40, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
                >
                  <Minus size={16} />
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
                    height: 40,
                    fontSize: '1.125rem',
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
                  style={{ width: 36, height: 40, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-center" style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 2 }}>Peso (kg)</div>
            </div>

            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                  onClick={() => adjustReps(-1)}
                  style={{ width: 36, height: 40, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
                >
                  <Minus size={16} />
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
                    height: 40,
                    fontSize: '1.125rem',
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
                  style={{ width: 36, height: 40, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-center" style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 2 }}>Reps</div>
            </div>
          </div>

          {/* Add button */}
          <button
            className="btn btn-primary w-100 btn-action d-flex align-items-center justify-content-center gap-2"
            onClick={handleAddSet}
            disabled={addSet.isPending}
            style={{ minHeight: 52, borderRadius: 12, fontSize: '1rem' }}
          >
            {addSet.isPending ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <>
                <Plus size={20} />
                <span>Agregar serie</span>
              </>
            )}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
