import { useState } from 'react';
import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import { useWorkouts, useDeleteWorkout } from '../hooks/useWorkouts';
import { useConfirm } from '../../../hooks/useConfirm';
import { formatDateFull } from '../../../utils/date.utils';
import { formatVolume } from '../../../utils/volume.utils';
import {
  CalendarDays, CheckCircle2, Flame, CircleDot, Dumbbell,
  ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkoutsHistoryPage() {
  const { confirm, dialog } = useConfirm();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWorkouts(page);
  const deleteWorkout = useDeleteWorkout();

  const workouts = Array.isArray(data) ? data : ((data as any)?.data ?? []);
  const meta = Array.isArray(data) ? {} : ((data as any)?.meta ?? {});
  const totalPages = meta.totalPages ?? 1;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: <CheckCircle2 size={16} />,
          label: 'Completado',
          bg: 'rgba(45, 106, 79, 0.12)',
          border: 'rgba(45, 106, 79, 0.3)',
          color: '#2d6a4f',
          textColor: '#34d399',
        };
      case 'IN_PROGRESS':
        return {
          icon: <Flame size={16} />,
          label: 'En curso',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          textColor: '#fbbf24',
        };
      case 'CANCELLED':
        return {
          icon: <CircleDot size={16} />,
          label: 'Cancelado',
          bg: 'rgba(100, 116, 139, 0.12)',
          border: 'rgba(100, 116, 139, 0.3)',
          color: '#64748b',
          textColor: '#94a3b8',
        };
      default:
        return {
          icon: <CircleDot size={16} />,
          label: status,
          bg: 'rgba(100, 116, 139, 0.12)',
          border: 'rgba(100, 116, 139, 0.3)',
          color: '#64748b',
          textColor: '#94a3b8',
        };
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #1e3a5f, #4338ca)', borderRadius: 2 }} />
          <h5 className="fw-bold text-white mb-0">Historial</h5>
        </div>
        <p className="text-white-50 small mb-0">
          Todos tus entrenamientos registrados
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : workouts.length === 0 ? (
        <EmptyState
          title="Sin entrenamientos"
          description="Todavía no registraste ningún entrenamiento. ¡Empezá hoy!"
        />
      ) : (
        <>
          {/* Workouts list */}
          <div className="d-flex flex-column gap-2 mb-4">
            {workouts.map((w: any) => {
              const status = getStatusConfig(w.status);
              const totalVolume = w.sets?.reduce((sum: number, s: any) => sum + (s.volume ?? 0), 0) ?? 0;
              const totalSets = w.sets?.length ?? 0;
              const totalReps = w.sets?.reduce((sum: number, s: any) => sum + s.reps, 0) ?? 0;
              const prCount = w.sets?.filter((s: any) => s.isPR).length ?? 0;

              return (
                <div
                  key={w.id}
                  className="card"
                  style={{
                    border: 'none',
                    borderRadius: 16,
                    overflow: 'hidden',
                    borderLeft: `3px solid ${status.color}`,
                  }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle"
                          style={{
                            width: 32, height: 32,
                            background: status.bg,
                            border: `1px solid ${status.border}`,
                          }}
                        >
                          <span style={{ color: status.color }}>{status.icon}</span>
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ color: '#1e293b', fontSize: '0.9375rem' }}>
                            {w.name ?? 'Entrenamiento'}
                          </div>
                          <div className="small d-flex align-items-center gap-1" style={{ color: '#94a3b8' }}>
                            <CalendarDays size={12} />
                            {formatDateFull(w.date)}
                            {w.durationMin && (
                              <span>· {w.durationMin} min</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="badge px-2 py-1"
                          style={{
                            background: status.bg,
                            border: `1px solid ${status.border}`,
                            color: status.color,
                            fontSize: '0.6875rem',
                          }}
                        >
                          {status.label}
                        </span>
                        <button
                          className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Eliminar entrenamiento',
                              message: '¿Eliminar este entrenamiento?',
                              confirmLabel: 'Eliminar',
                              variant: 'danger',
                            });
                            if (!ok) return;
                            deleteWorkout.mutate(w.id);
                          }}
                          disabled={deleteWorkout.isPending}
                          title="Eliminar"
                          style={{ width: 28, height: 28, borderRadius: 8 }}
                        >
                          {deleteWorkout.isPending ? (
                            <span className="spinner-border spinner-border-sm" style={{ width: 14, height: 14 }} />
                          ) : (
                            <Trash2 size={14} style={{ color: '#dc2626' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="d-flex align-items-center gap-3 mt-2">
                      <div className="d-flex align-items-center gap-1">
                        <Dumbbell size={14} style={{ color: '#64748b' }} />
                        <span className="small" style={{ color: '#64748b' }}>
                          {totalSets} series
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Σ</span>
                        <span className="small" style={{ color: '#64748b' }}>
                          {totalReps} reps
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <span className="small fw-medium" style={{ color: '#1e3a5f' }}>
                          {formatVolume(totalVolume)}
                        </span>
                      </div>
                      {prCount > 0 && (
                        <div className="d-flex align-items-center gap-1 ms-auto">
                          <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>★</span>
                          <span className="small" style={{ color: '#f59e0b' }}>
                            {prCount} PR
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between">
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="small text-white-50">
                Página {page} de {totalPages}
              </span>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Back link */}
      <div className="mt-4 text-center">
        <Link to="/" className="small text-white-50" style={{ textDecoration: 'none' }}>
          ← Volver al inicio
        </Link>
      </div>
      {dialog}
    </AppShell>
  );
}
