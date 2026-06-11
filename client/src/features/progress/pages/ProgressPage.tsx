import { useState, useMemo, useCallback } from 'react';
import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import StrengthChart from '../components/StrengthChart';
import VolumeChart from '../components/VolumeChart';
import PRBadge from '../../../components/ui/PRBadge';
import ExercisePicker from '../../exercises/components/ExercisePicker';
import { useExerciseProgress, usePersonalRecord, useOneRMHistory } from '../hooks/useProgress';
import { useVolumeWeekly } from '../../stats/hooks/useStats';
import type { Exercise } from '../../../types/workout.types';
import { Trophy, ChevronDown, BarChart3, TrendingUp, Target, Filter } from 'lucide-react';
import { format1RM } from '../../../utils/orm.utils';
import { formatDate, todayISO } from '../../../utils/date.utils';

type DateRange = '30d' | '90d' | '6m' | '1y' | 'all';

const RANGE_LABELS: Record<DateRange, string> = {
  '30d': '30 días',
  '90d': '90 días',
  '6m': '6 meses',
  '1y': '1 año',
  all: 'Todo',
};

function getRangeDates(range: DateRange): { from?: string; to?: string } {
  const to = todayISO();
  const d = new Date();
  switch (range) {
    case '30d':
      d.setDate(d.getDate() - 30);
      return { from: d.toISOString().split('T')[0], to };
    case '90d':
      d.setDate(d.getDate() - 90);
      return { from: d.toISOString().split('T')[0], to };
    case '6m':
      d.setMonth(d.getMonth() - 6);
      return { from: d.toISOString().split('T')[0], to };
    case '1y':
      d.setFullYear(d.getFullYear() - 1);
      return { from: d.toISOString().split('T')[0], to };
    default:
      return {};
  }
}

export default function ProgressPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'strength' | '1rm' | 'volume'>('strength');
  const [dateRange, setDateRange] = useState<DateRange>('90d');

  const { from, to } = useMemo(() => getRangeDates(dateRange), [dateRange]);

  const { data: progressData, isLoading: loadingProgress } = useExerciseProgress(
    selectedExercise?.id ?? '',
    from,
    to,
  );
  const { data: pr, isLoading: loadingPR } = usePersonalRecord(selectedExercise?.id ?? '');
  const { data: oneRMData, isLoading: loading1RM } = useOneRMHistory(
    selectedExercise?.id ?? '',
    from,
    to,
  );
  const { data: weeklyVolume, isLoading: loadingWeekly } = useVolumeWeekly();

  const handleSelectExercise = useCallback((ex: Exercise) => {
    setSelectedExercise(ex);
    setShowPicker(false);
  }, []);

  const chartData = useMemo(() => {
    if (!progressData?.length) return [];
    if (activeTab === 'volume') {
      return progressData.map((d) => ({ date: d.date, totalVolume: d.totalVolume }));
    }
    if (activeTab === '1rm') {
      return oneRMData?.length
        ? oneRMData.map((d) => ({ date: d.date, value: d.oneRepMax, isPR: false }))
        : progressData.map((d) => ({ date: d.date, value: d.bestOneRepMax, isPR: d.isPR }));
    }
    return progressData.map((d) => ({ date: d.date, value: d.maxWeightKg, isPR: d.isPR }));
  }, [progressData, oneRMData, activeTab]);

  const showPR = pr && selectedExercise && !loadingPR;

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #4338ca, #1e3a5f)', borderRadius: 2 }} />
          <h5 className="fw-bold text-white mb-0">Progreso</h5>
        </div>
        <p className="text-white-50 small mb-0">
          Seguimiento de fuerza, 1RM y volumen por ejercicio
        </p>
      </div>

      {/* Exercise selector */}
      <button
        className="btn w-100 d-flex align-items-center justify-content-between mb-3 p-3"
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
        onSelect={handleSelectExercise}
      />

      {/* Empty state when no exercise selected */}
      {!selectedExercise && (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16 }}>
          <div className="card-body p-4 text-center">
            <EmptyState
              title="Seleccioná un ejercicio"
              description="Elegí un ejercicio del catálogo para ver tu progreso de fuerza, 1RM y volumen a lo largo del tiempo."
              dark={false}
            />
          </div>
        </div>
      )}

      {/* Date range filter */}
      {selectedExercise && (
        <div className="d-flex align-items-center gap-2 mb-3 overflow-auto pb-1">
          <Filter size={14} className="text-white-50 flex-shrink-0" />
          {(Object.keys(RANGE_LABELS) as DateRange[]).map((range) => (
            <button
              key={range}
              className={`btn btn-sm ${dateRange === range ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={{
                fontSize: '0.75rem',
                borderRadius: 20,
                borderColor: dateRange === range ? 'transparent' : 'rgba(255,255,255,0.2)',
                color: dateRange === range ? '#fff' : 'rgba(255,255,255,0.6)',
                background: dateRange === range ? 'linear-gradient(135deg, #4338ca, #1e3a5f)' : 'transparent',
              }}
              onClick={() => setDateRange(range)}
            >
              {RANGE_LABELS[range]}
            </button>
          ))}
        </div>
      )}

      {/* PR card */}
      {showPR && (
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

      {/* Loading PR */}
      {selectedExercise && loadingPR && (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16 }}>
          <div className="card-body p-3 d-flex align-items-center justify-content-center" style={{ minHeight: 120 }}>
            <LoadingSpinner size="sm" />
          </div>
        </div>
      )}

      {/* Exercise charts */}
      {selectedExercise && (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16 }}>
          <div className="card-header p-0" style={{ borderRadius: '16px 16px 0 0', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <ul className="nav nav-tabs card-header-tabs">
              {(['strength', '1rm', 'volume'] as const).map((tab) => (
                <li key={tab} className="nav-item">
                  <button
                    className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      fontSize: '0.8125rem',
                      background: activeTab === tab ? 'rgba(67, 56, 202, 0.25)' : 'transparent',
                      borderColor: activeTab === tab ? 'rgba(67, 56, 202, 0.5)' : 'transparent',
                      color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
                      borderRadius: '8px 8px 0 0',
                    }}
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
          <div className="card-body p-3">
            {loadingProgress || (activeTab === '1rm' && loading1RM) ? (
              <LoadingSpinner size="sm" />
            ) : !chartData.length ? (
              <EmptyState title="Sin datos en este período" description={`No hay registros de ${selectedExercise.nameEs ?? selectedExercise.name} en el rango seleccionado.`} dark={false} />
            ) : activeTab === 'volume' ? (
              <VolumeChart data={chartData as { date: string; totalVolume: number }[]} />
            ) : (
              <StrengthChart
                data={chartData as { date: string; value: number; isPR: boolean }[]}
                metric={activeTab === 'strength' ? 'Peso máx.' : '1RM estimado'}
              />
            )}
          </div>
        </div>
      )}

      {/* Weekly volume */}
      <div className="card" style={{ border: 'none', borderRadius: 16 }}>
        <div className="card-header fw-semibold py-3 d-flex align-items-center gap-2" style={{ borderRadius: '16px 16px 0 0', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 28, height: 28, background: 'rgba(56, 189, 248, 0.15)' }}
          >
            <BarChart3 size={14} style={{ color: '#38bdf8' }} />
          </div>
          <span>Volumen semanal (12 semanas)</span>
        </div>
        <div className="card-body p-3">
          {loadingWeekly ? (
            <LoadingSpinner size="sm" />
          ) : !weeklyVolume?.length ? (
            <EmptyState title="Sin datos" description="Completá workouts para ver tu volumen" dark={false} />
          ) : (
            <VolumeChart data={weeklyVolume.map((d) => ({ week: d.week, totalVolume: d.totalVolume }))} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
