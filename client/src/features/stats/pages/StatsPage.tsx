import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import MetricCard from '../../../components/ui/MetricCard';
import { useStats, useFrequency, useVolumeWeekly } from '../hooks/useStats';
import VolumeChart from '../../progress/components/VolumeChart';
import { MUSCLE_GROUP_LABELS, MuscleGroup } from '../../../types/workout.types';
import { Flame, Dumbbell, TrendingUp, Calendar } from 'lucide-react';
import { formatVolume } from '../../../utils/volume.utils';

export default function StatsPage() {
  const { data: stats, isLoading } = useStats();
  const { data: frequency } = useFrequency(8);
  const { data: weeklyVolume } = useVolumeWeekly();

  return (
    <AppShell>
      <h5 className="fw-bold mb-3">Estadísticas</h5>

      {isLoading ? (
        <LoadingSpinner />
      ) : stats ? (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6">
              <MetricCard label="Total workouts" value={stats.totalWorkouts} icon={<Dumbbell size={18} />} />
            </div>
            <div className="col-6">
              <MetricCard label="Racha actual" value={`${stats.currentStreak} días`} icon={<Flame size={18} />} highlight={stats.currentStreak > 2} />
            </div>
            <div className="col-6">
              <MetricCard label="Racha máxima" value={`${stats.longestStreak} días`} icon={<TrendingUp size={18} />} />
            </div>
            <div className="col-6">
              <MetricCard label="Vol. esta semana" value={formatVolume(stats.weeklyVolumeKg)} icon={<Calendar size={18} />} />
            </div>
          </div>

          {/* Streak card */}
          <div className="card mb-4 text-center">
            <div className="card-body py-4">
              <div className="streak-number text-primary">{stats.currentStreak}</div>
              <div className="fw-semibold">días de racha</div>
              <div className="small text-muted mt-1">Máxima: {stats.longestStreak} días</div>
              {stats.currentStreak > 0 && (
                <div className="mt-2">
                  {'🔥'.repeat(Math.min(stats.currentStreak, 10))}
                </div>
              )}
            </div>
          </div>

          {/* Muscle frequency */}
          {frequency && frequency.length > 0 && (
            <div className="card mb-4">
              <div className="card-header fw-semibold py-2">Frecuencia por músculo (8 semanas)</div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {[...frequency]
                    .sort((a, b) => b.totalSets - a.totalSets)
                    .map((f) => (
                      <li key={f.muscleGroup} className="list-group-item d-flex align-items-center py-2 px-3">
                        <span className="flex-grow-1 small fw-medium">
                          {MUSCLE_GROUP_LABELS[f.muscleGroup as MuscleGroup] ?? f.muscleGroup}
                        </span>
                        <div className="progress flex-grow-1 mx-2" style={{ height: 8 }}>
                          <div
                            className="progress-bar bg-dark"
                            style={{ width: `${Math.min((f.totalSets / (frequency[0]?.totalSets || 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="small text-muted ms-2" style={{ minWidth: 40, textAlign: 'right' }}>
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
            <div className="card">
              <div className="card-header fw-semibold py-2">Volumen semanal</div>
              <div className="card-body p-2">
                <VolumeChart
                  data={weeklyVolume.map((d) => ({ week: d.week, totalVolume: d.totalVolume }))}
                  xKey="week"
                />
              </div>
            </div>
          )}
        </>
      ) : null}
    </AppShell>
  );
}
