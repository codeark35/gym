import type { WorkoutSet, Workout } from '../../../types/workout.types';
import PRBadge from '../../../components/ui/PRBadge';
import { formatVolume } from '../../../utils/volume.utils';
import { formatDateFull } from '../../../utils/date.utils';
import { useWorkoutsForDate } from '../hooks/useWorkouts';
import {
  Trophy, CheckCircle2, Dumbbell, Clock, ArrowRight, Plus,
  BarChart3
} from 'lucide-react';

interface WorkoutSummaryProps {
  date: string;
  workout?: Workout | null;
  onClose?: () => void;
  onNewWorkout?: () => void;
}

function calculateStats(sets: WorkoutSet[]) {
  const totalSets = sets.length;
  const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
  const totalVolume = sets.reduce((sum, s) => sum + (s.volume ?? 0), 0);
  const prSets = sets.filter((s) => s.isPR);
  const uniqueExercises = new Set(sets.map((s) => s.exerciseId)).size;
  return { totalSets, totalReps, totalVolume, prSets, uniqueExercises };
}

function SingleWorkoutSummary({
  workout,
  stats,
  onClose,
  onNewWorkout,
}: {
  workout: Workout;
  stats: ReturnType<typeof calculateStats>;
  onClose?: () => void;
  onNewWorkout?: () => void;
}) {
  const { totalSets, totalReps, totalVolume, prSets, uniqueExercises } = stats;
  const hasPRs = prSets.length > 0;

  return (
    <div className="card mb-4" style={{ border: 'none', borderRadius: 20, overflow: 'hidden' }}>
      <div className="card-body p-0 position-relative">
        <div
          className="p-4 text-center position-relative"
          style={{
            background: hasPRs
              ? 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 50%, #1e3a5f 100%)'
              : 'linear-gradient(135deg, #2d6a4f 0%, #3d7a5f 50%, #2d6a4f 100%)',
          }}
        >
          <div
            className="position-absolute"
            style={{
              top: -60, right: -40,
              width: 180, height: 180,
              borderRadius: '50%',
              background: hasPRs
                ? 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(52, 211, 153, 0.2) 0%, transparent 70%)',
            }}
          />

          <div className="position-relative">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <CheckCircle2 size={36} className="text-white" />
            </div>

            <h5 className="fw-bold text-white mb-1">¡Entrenamiento completado!</h5>
            <p className="text-white-50 small mb-4">{formatDateFull(workout.date)}</p>

            {/* Stats grid */}
            <div className="row g-3 mb-4">
              <div className="col-4">
                <div
                  className="p-2 rounded-3"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="fs-3 fw-bold text-white">{totalSets}</div>
                  <div className="small text-white-50">series</div>
                </div>
              </div>
              <div className="col-4">
                <div
                  className="p-2 rounded-3"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="fs-3 fw-bold text-white">{totalReps}</div>
                  <div className="small text-white-50">reps</div>
                </div>
              </div>
              <div className="col-4">
                <div
                  className="p-2 rounded-3"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="fs-3 fw-bold text-white">{formatVolume(totalVolume)}</div>
                  <div className="small text-white-50">volumen</div>
                </div>
              </div>
            </div>

            {/* Extra info */}
            <div className="d-flex align-items-center justify-content-center gap-3 mb-3 small text-white-50">
              <span className="d-flex align-items-center gap-1">
                <Dumbbell size={14} />
                {uniqueExercises} ejercicios
              </span>
              {workout.durationMin && (
                <span className="d-flex align-items-center gap-1">
                  <Clock size={14} />
                  {workout.durationMin} min
                </span>
              )}
            </div>

            {/* PR celebration */}
            {hasPRs && (
              <div
                className="mb-3 p-3 rounded-3"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <div className="d-flex align-items-center justify-content-center gap-2 fw-bold text-white mb-2">
                  <Trophy size={18} style={{ color: '#fbbf24' }} />
                  <span style={{ color: '#fbbf24' }}>
                    {prSets.length} {prSets.length === 1 ? 'nuevo PR' : 'nuevos PRs'}
                  </span>
                </div>
                <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
                  {prSets.map((s) => (
                    <div
                      key={s.id}
                      className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <span className="text-white">{s.exercise.nameEs ?? s.exercise.name}</span>
                      <PRBadge size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex gap-2">
              {onNewWorkout && (
                <button
                  className="btn flex-fill btn-action fw-bold"
                  onClick={onNewWorkout}
                  style={{ borderRadius: 12, background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}
                >
                  <Plus size={18} className="me-2" />
                  Nuevo entrenamiento
                </button>
              )}
              {onClose && (
                <button
                  className="btn btn-light flex-fill btn-action fw-bold"
                  onClick={onClose}
                  style={{ borderRadius: 12 }}
                >
                  <ArrowRight size={18} className="me-2" />
                  Listo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalSummary({
  workouts,
  onClose,
  onNewWorkout,
}: {
  workouts: Workout[];
  onClose?: () => void;
  onNewWorkout?: () => void;
}) {
  const allSets = workouts.flatMap(w => w.sets);
  const stats = calculateStats(allSets);
  const { totalSets, totalReps, totalVolume, prSets, uniqueExercises } = stats;
  const hasPRs = prSets.length > 0;
  const totalDuration = workouts.reduce((sum, w) => sum + (w.durationMin ?? 0), 0);

  return (
    <div className="card mb-4" style={{ border: 'none', borderRadius: 20, overflow: 'hidden' }}>
      <div className="card-body p-0 position-relative">
        <div
          className="p-4 text-center position-relative"
          style={{
            background: hasPRs
              ? 'linear-gradient(135deg, #1e3a5f 0%, #4338ca 50%, #1e3a5f 100%)'
              : 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 50%, #1e3a5f 100%)',
          }}
        >
          <div
            className="position-absolute"
            style={{
              top: -60, right: -40,
              width: 180, height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
            }}
          />

          <div className="position-relative">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.2)',
              }}
            >
              <BarChart3 size={36} className="text-white" />
            </div>

            <h5 className="fw-bold text-white mb-1">Resumen del día</h5>
            <p className="text-white-50 small mb-4">
              {workouts.length} entrenamientos · {formatDateFull(workouts[0].date)}
            </p>

            {/* Stats grid */}
            <div className="row g-3 mb-4">
              <div className="col-3">
                <div
                  className="p-2 rounded-3"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="fs-3 fw-bold text-white">{totalSets}</div>
                  <div className="small text-white-50">series</div>
                </div>
              </div>
              <div className="col-3">
                <div
                  className="p-2 rounded-3"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="fs-3 fw-bold text-white">{totalReps}</div>
                  <div className="small text-white-50">reps</div>
                </div>
              </div>
              <div className="col-3">
                <div
                  className="p-2 rounded-3"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="fs-3 fw-bold text-white">{formatVolume(totalVolume)}</div>
                  <div className="small text-white-50">volumen</div>
                </div>
              </div>
              <div className="col-3">
                <div
                  className="p-2 rounded-3"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="fs-3 fw-bold text-white">{workouts.length}</div>
                  <div className="small text-white-50">sesiones</div>
                </div>
              </div>
            </div>

            {/* Extra info */}
            <div className="d-flex align-items-center justify-content-center gap-3 mb-3 small text-white-50">
              <span className="d-flex align-items-center gap-1">
                <Dumbbell size={14} />
                {uniqueExercises} ejercicios
              </span>
              {totalDuration > 0 && (
                <span className="d-flex align-items-center gap-1">
                  <Clock size={14} />
                  {totalDuration} min total
                </span>
              )}
            </div>

            {/* Workout list */}
            <div className="mb-3 text-start">
              {workouts.map((w, i) => (
                <div
                  key={w.id}
                  className="d-flex align-items-center gap-2 mb-2 p-2 rounded-3"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)' }}
                  >
                    <span className="text-white fw-bold small">{i + 1}</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-white small fw-medium">{w.name ?? `Entrenamiento ${i + 1}`}</div>
                    <div className="text-white-50" style={{ fontSize: '0.75rem' }}>
                      {w.sets.length} series · {formatVolume(w.sets.reduce((sum, s) => sum + (s.volume ?? 0), 0))}
                    </div>
                  </div>
                  <div className="text-white-50 small">
                    {w.sets.filter(s => s.isPR).length > 0 && (
                      <span style={{ color: '#fbbf24' }}>
                        {w.sets.filter(s => s.isPR).length} PR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* PR celebration */}
            {hasPRs && (
              <div
                className="mb-3 p-3 rounded-3"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <div className="d-flex align-items-center justify-content-center gap-2 fw-bold text-white mb-2">
                  <Trophy size={18} style={{ color: '#fbbf24' }} />
                  <span style={{ color: '#fbbf24' }}>
                    {prSets.length} {prSets.length === 1 ? 'nuevo PR' : 'nuevos PRs'} en el día
                  </span>
                </div>
              </div>
            )}

            <div className="d-flex gap-2">
              {onNewWorkout && (
                <button
                  className="btn flex-fill btn-action fw-bold"
                  onClick={onNewWorkout}
                  style={{ borderRadius: 12, background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}
                >
                  <Plus size={18} className="me-2" />
                  Nuevo entrenamiento
                </button>
              )}
              {onClose && (
                <button
                  className="btn btn-light flex-fill btn-action fw-bold"
                  onClick={onClose}
                  style={{ borderRadius: 12 }}
                >
                  <ArrowRight size={18} className="me-2" />
                  Listo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutSummary({ date, workout, onClose, onNewWorkout }: WorkoutSummaryProps) {
  const { data: dateWorkouts } = useWorkoutsForDate(date);
  const completedWorkouts = (dateWorkouts ?? []).filter(w => w.status === 'COMPLETED');

  // Si hay múltiples entrenamientos completados, mostrar resumen global
  if (completedWorkouts.length > 1) {
    return <GlobalSummary workouts={completedWorkouts} onClose={onClose} onNewWorkout={onNewWorkout} />;
  }

  // Si hay un solo entrenamiento (o ninguno), mostrar el individual
  const sets = workout?.sets ?? completedWorkouts[0]?.sets ?? [];
  const activeWorkout = workout ?? completedWorkouts[0];

  if (!activeWorkout) {
    return (
      <div className="text-center py-5">
        <p className="text-white-50">No hay datos del entrenamiento</p>
        {onNewWorkout && (
          <button
            className="btn btn-primary btn-action fw-bold"
            onClick={onNewWorkout}
            style={{ borderRadius: 12 }}
          >
            <Plus size={18} className="me-2" />
            Nuevo entrenamiento
          </button>
        )}
      </div>
    );
  }

  return (
    <SingleWorkoutSummary
      workout={activeWorkout}
      stats={calculateStats(sets)}
      onClose={onClose}
      onNewWorkout={onNewWorkout}
    />
  );
}
