import { useState } from 'react';
import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import StrengthChart from '../components/StrengthChart';
import VolumeChart from '../components/VolumeChart';
import PRBadge from '../../../components/ui/PRBadge';
import ExercisePicker from '../../exercises/components/ExercisePicker';
import { useExerciseProgress, usePersonalRecord, useOneRMHistory } from '../hooks/useProgress';
import { useVolumeWeekly } from '../../stats/hooks/useStats';
import { Exercise } from '../../../types/workout.types';
import { TrendingUp, Trophy, ChevronDown } from 'lucide-react';
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
      <h5 className="fw-bold mb-3">Progreso</h5>

      {/* Exercise selector */}
      <button
        className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-between mb-4"
        onClick={() => setShowPicker(true)}
      >
        <span>{selectedExercise ? (selectedExercise.nameEs ?? selectedExercise.name) : 'Seleccionar ejercicio...'}</span>
        <ChevronDown size={16} />
      </button>

      <ExercisePicker
        show={showPicker}
        onHide={() => setShowPicker(false)}
        onSelect={(ex) => { setSelectedExercise(ex); setShowPicker(false); }}
      />

      {/* PR card */}
      {pr && selectedExercise && (
        <div className="card mb-3 border-warning">
          <div className="card-body p-3">
            <div className="d-flex align-items-center gap-2 mb-1">
              <Trophy size={18} className="text-warning" />
              <span className="fw-semibold">Record personal</span>
              <PRBadge />
            </div>
            <div className="fs-4 fw-bold">
              {pr.weightKg} kg × {pr.reps} reps
            </div>
            <div className="small text-muted">
              1RM estimado: {format1RM(pr.oneRepMax ?? 0)} · {pr.workout?.date ? formatDate(pr.workout.date) : ''}
            </div>
          </div>
        </div>
      )}

      {/* Exercise charts */}
      {selectedExercise && (
        <div className="card mb-4">
          <div className="card-header p-0">
            <ul className="nav nav-tabs card-header-tabs">
              {(['strength', '1rm'] as const).map((tab) => (
                <li key={tab} className="nav-item">
                  <button
                    className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'strength' ? 'Peso máx.' : '1RM'}
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
      <div className="card">
        <div className="card-header fw-semibold py-2">Volumen semanal (12 semanas)</div>
        <div className="card-body p-2">
          {loadingWeekly ? (
            <LoadingSpinner size="sm" />
          ) : !weeklyVolume?.length ? (
            <EmptyState title="Sin datos" description="Completá workouts para ver tu volumen" />
          ) : (
            <VolumeChart data={weeklyVolume.map((d) => ({ week: d.week, totalVolume: d.totalVolume }))} xKey="week" />
          )}
        </div>
      </div>
    </AppShell>
  );
}
