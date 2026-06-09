import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import StatsGrid from '../components/StatsGrid';
import StreakCard from '../components/StreakCard';
import VolumeChart from '../../progress/components/VolumeChart';
import { useStats, useFrequency, useVolumeWeekly } from '../hooks/useStats';
import type { MuscleGroup } from '../../../types/workout.types';
import { MUSCLE_GROUP_LABELS } from '../../../types/workout.types';
import { BarChart3, Activity, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StatsPage() {
  const { data: stats, isLoading } = useStats();
  const { data: frequency } = useFrequency(8);
  const { data: weeklyVolume } = useVolumeWeekly();

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #f59e0b, #fbbf24)', borderRadius: 2 }} />
          <h5 className="fw-bold text-white mb-0">Estadísticas</h5>
        </div>
        <p className="text-white-50 small mb-0">
          Análisis de tu rendimiento y constancia
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : stats ? (
        <>
          {/* Stats Section */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #1e3a5f, #4338ca)', borderRadius: 2 }} />
            <h6 className="fw-bold text-white mb-0 text-uppercase" style={{ letterSpacing: 1, fontSize: '0.8125rem' }}>
              Resumen
            </h6>
          </div>
          <StatsGrid stats={stats} />

          {/* Streak Section */}
          <div className="mt-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #f59e0b, #fbbf24)', borderRadius: 2 }} />
              <h6 className="fw-bold text-white mb-0 text-uppercase" style={{ letterSpacing: 1, fontSize: '0.8125rem' }}>
                Racha
              </h6>
            </div>
            <StreakCard current={stats.currentStreak} longest={stats.longestStreak} />
          </div>

          {/* Muscle frequency */}
          {frequency && frequency.length > 0 && (
            <div className="card mb-4" style={{ border: 'none', borderRadius: 16 }}>
              <div className="card-header fw-semibold py-3 d-flex align-items-center gap-2" style={{ borderRadius: '16px 16px 0 0' }}>
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 28, height: 28, background: 'rgba(67, 56, 202, 0.1)' }}
                >
                  <Activity size={14} style={{ color: '#4338ca' }} />
                </div>
                <span>Frecuencia por músculo (8 semanas)</span>
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {[...frequency]
                    .sort((a, b) => b.totalSets - a.totalSets)
                    .map((f) => (
                      <li key={f.muscleGroup} className="list-group-item d-flex align-items-center py-2 px-3">
                        <span className="flex-grow-1 small fw-medium">
                          {MUSCLE_GROUP_LABELS[f.muscleGroup as MuscleGroup] ?? f.muscleGroup}
                        </span>
                        <div className="progress flex-grow-1 mx-2" style={{ height: 8, borderRadius: 4 }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${Math.min((f.totalSets / (frequency[0]?.totalSets || 1)) * 100, 100)}%`,
                              background: 'linear-gradient(90deg, #1e3a5f, #4338ca)',
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <span className="small ms-2" style={{ minWidth: 40, textAlign: 'right', color: '#64748b', fontWeight: 500 }}>
                          {f.totalSets} series
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* Weekly volume chart */}
          {weeklyVolume && weeklyVolume.length > 0 && (
            <div className="card" style={{ border: 'none', borderRadius: 16 }}>
              <div className="card-header fw-semibold py-3 d-flex align-items-center gap-2" style={{ borderRadius: '16px 16px 0 0' }}>
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 28, height: 28, background: 'rgba(30, 58, 95, 0.1)' }}
                >
                  <BarChart3 size={14} style={{ color: '#1e3a5f' }} />
                </div>
                <span>Volumen semanal</span>
              </div>
              <div className="card-body p-2">
                <VolumeChart
                  data={weeklyVolume.map((d) => ({ week: d.week, totalVolume: d.totalVolume }))}
                />
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Link to history */}
      <div className="mt-4 mb-2">
        <Link
          to="/workouts"
          className="btn btn-outline-light w-100 btn-action d-flex align-items-center justify-content-center"
        >
          <CalendarDays size={18} className="me-2" />
          Ver historial completo
        </Link>
      </div>
    </AppShell>
  );
}
