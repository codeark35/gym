import { useState } from 'react';
import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import StrengthChart from '../components/StrengthChart';
import VolumeChart from '../components/VolumeChart';
import PRBadge from '../../../components/ui/PRBadge';
import ExercisePicker from '../../exercises/components/ExercisePicker';
import { useExerciseProgress, usePersonalRecord } from '../hooks/useProgress';
import { useVolumeWeekly } from '../../stats/hooks/useStats';
import type { Exercise } from '../../../types/workout.types';
import { Trophy, ChevronDown, BarChart3, TrendingUp, Target } from 'lucide-react';
import { format1RM } from '../../../utils/orm.utils';
import { formatDate } from '../../../utils/date.utils';

export default function ProgressPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'strength' | '1rm' | 'volume'>('strength');

  const { data: progressData, isLoading: loadingProgress } = useExerciseProgress(
    selectedExercise?.id ?? '',
  );
  const { data: pr } = usePersonalRecord(selectedExercise?.id ?? '');
  const { data: weeklyVolume, isLoading: loadingWeekly } = useVolumeWeekly();

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #4338ca, #1e3a5f)', borderRadius: 2 }} />
          <h5 className="fw-bold text-white mb-0">Progreso</h5>
        </div>
        <p className="text-white-50 small mb-0">
          Seguimiento de fuerza y volumen por ejercicio
        </p>
      </div>

      {/* Exercise selector */}
      <button
        className="btn w-100 d-flex align-items-center justify-content-between mb-4 p-3"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          color: 'white',
        }}
        onClick={() => setShowPicker(true)}
      >
        <div className="d-flex align-items-center gap-2">
          <Target size={18} style={{ color: '#f59e0b' }} />
          <span>{selectedExercise ? (selectedExercise.nameEs ?? selectedExercise.name) : 'Seleccionar ejercicio...'}</span>
        </div>
        <ChevronDown size={16} className="text-white-50" />
      </button>

      <ExercisePicker
        show={showPicker}
        onHide={() => setShowPicker(false)}
        onSelect={(ex) => { setSelectedExercise(ex); setShowPicker(false); }}
      />

      {/* PR card */}
      {pr && selectedExercise && (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16, overflow: 'hidden' }}>
          <div
            className="card-body p-3 position-relative"
            style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
          >
            <div className="position-absolute" style={{
              top: -20, right: -20, width: 100, height: 100, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
            }} />
            <div className="position-relative">
              <div className="d-flex align-items-center gap-2 mb-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 36, height: 36, background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
                >
                  <Trophy size={18} style={{ color: '#fbbf24' }} />
                </div>
                <div>
                  <span className="fw-semibold text-white">Record personal</span>
                  <PRBadge animate />
                </div>
              </div>
              <div className="d-flex align-items-baseline gap-2">
                <span className="fw-bold text-white" style={{ fontSize: '2rem' }}>
                  {pr.weightKg} kg
                </span>
                <span className="text-white-50">× {pr.reps} reps</span>
              </div>
              <div className="small mt-1" style={{ color: '#94a3b8' }}>
                1RM estimado: <span className="fw-semibold" style={{ color: '#fbbf24' }}>{format1RM(pr.oneRepMax ?? 0)}</span>
                <span className="mx-2">·</span>
                {pr.workout?.date ? formatDate(pr.workout.date) : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise charts */}
      {selectedExercise && (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16 }}>
          <div className="card-header p-0" style={{ borderRadius: '16px 16px 0 0' }}>
            <ul className="nav nav-tabs card-header-tabs">
              {(['strength', '1rm', 'volume'] as const).map((tab) => (
                <li key={tab} className="nav-item">
                  <button
                    className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {tab === 'strength' ? (
                      <span className="d-flex align-items-center gap-1">
                        <TrendingUp size={14} /> Peso máx.
                      </span>
                    ) : tab === '1rm' ? (
                      <span className="d-flex align-items-center gap-1">
                        <Target size={14} /> 1RM
                      </span>
                    ) : (
                      <span className="d-flex align-items-center gap-1">
                        <BarChart3 size={14} /> Volumen
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-body p-2">
            {loadingProgress ? (
              <LoadingSpinner size="sm" />
            ) : !progressData?.length ? (
              <EmptyState title="Sin datos" description="Completá series para ver tu progreso" />
            ) : activeTab === 'volume' ? (
              <VolumeChart
                data={progressData.map((d) => ({
                  date: d.date,
                  totalVolume: d.totalVolume,
                }))}
              />
            ) : (
              <StrengthChart
                data={progressData}
                metric={activeTab === 'strength' ? 'maxWeightKg' : 'bestOneRepMax'}
              />
            )}
          </div>
        </div>
      )}

      {/* Weekly volume */}
      <div className="card" style={{ border: 'none', borderRadius: 16 }}>
        <div className="card-header fw-semibold py-3 d-flex align-items-center gap-2" style={{ borderRadius: '16px 16px 0 0' }}>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 28, height: 28, background: 'rgba(30, 58, 95, 0.1)' }}
          >
            <BarChart3 size={14} style={{ color: '#1e3a5f' }} />
          </div>
          <span>Volumen semanal (12 semanas)</span>
        </div>
        <div className="card-body p-2">
          {loadingWeekly ? (
            <LoadingSpinner size="sm" />
          ) : !weeklyVolume?.length ? (
            <EmptyState title="Sin datos" description="Completá workouts para ver tu volumen" />
          ) : (
            <VolumeChart data={weeklyVolume.map((d) => ({ week: d.week, totalVolume: d.totalVolume }))} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
