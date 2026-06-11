import { useRoutines } from '../hooks/useRoutines';

import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Dumbbell, Zap, ChevronRight } from 'lucide-react';

interface RoutinePickerProps {
  show: boolean;
  onHide: () => void;
  selectedDate: string;
  onStartFree: () => void;
  onStartRoutine: (routineId: string) => void;
  isStarting: boolean;
}

export default function RoutinePicker({
  show,
  onHide,
  onStartFree,
  onStartRoutine,
  isStarting,
}: RoutinePickerProps) {
  const { data, isLoading } = useRoutines(1, 50);
  const routines = data?.data ?? [];

  if (!show) return null;

  return (
    <div
      className="position-fixed start-0 end-0 bottom-0 top-0 d-flex flex-column"
      style={{ zIndex: 1055, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    >
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
        <h5 className="fw-bold text-white mb-0">Iniciar entrenamiento</h5>
        <button className="btn btn-sm btn-outline-light" onClick={onHide} style={{ borderRadius: 8 }}>
          ✕
        </button>
      </div>

      <div className="flex-fill overflow-auto p-3">
        <button
          className="btn btn-outline-warning w-100 text-start p-3 mb-3 d-flex align-items-center justify-content-between"
          onClick={() => {
            onStartFree();
            onHide();
          }}
          disabled={isStarting}
          style={{ borderRadius: 12, borderWidth: 2 }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(251, 191, 36, 0.15)',
              }}
            >
              <Zap size={20} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <div className="fw-bold text-light">Entrenamiento libre</div>
              <small className="text-white-50">Elegí ejercicios sobre la marcha</small>
            </div>
          </div>
          {isStarting ? (
            <span className="spinner-border spinner-border-sm text-light" />
          ) : (
            <ChevronRight size={20} className="text-white-50" />
          )}
        </button>

        <div className="d-flex align-items-center gap-2 mb-3">
          <div style={{ width: 4, height: 16, background: '#fbbf24', borderRadius: 2 }} />
          <span className="fw-semibold text-white small">O usá una rutina guardada</span>
        </div>

        {isLoading ? (
          <div className="d-flex justify-content-center py-4">
            <LoadingSpinner />
          </div>
        ) : routines.length === 0 ? (
          <div className="text-center py-4">
            <Dumbbell size={32} className="text-white-50 mb-2" />
            <p className="text-white-50 small mb-0">
              No tenés rutinas guardadas todavía.
            </p>
            <p className="text-white-50 small">
              Creá una desde la sección Rutinas.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {routines.map((routine) => (
              <button
                key={routine.id}
                className="btn btn-dark text-start p-3 d-flex align-items-center justify-content-between"
                onClick={() => {
                  onStartRoutine(routine.id);
                  onHide();
                }}
                disabled={isStarting || !routine.isActive}
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  opacity: routine.isActive ? 1 : 0.5,
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(59, 130, 246, 0.15)',
                    }}
                  >
                    <Dumbbell size={20} style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <div className="fw-bold text-light">{routine.name}</div>
                    <small className="text-white-50">
                      {routine.exercises.length} ejercicios
                      {routine.description ? ` · ${routine.description}` : ''}
                    </small>
                  </div>
                </div>
                <ChevronRight size={20} className="text-white-50" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
