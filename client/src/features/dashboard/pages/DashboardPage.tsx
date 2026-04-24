import AppShell from '../../../components/layout/AppShell';
import MetricCard from '../../../components/ui/MetricCard';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useStats } from '../../stats/hooks/useStats';
import { useTodayWorkout } from '../../workouts/hooks/useWorkouts';
import { Flame, Dumbbell, TrendingUp, Activity } from 'lucide-react';
import { formatVolume } from '../../../utils/volume.utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useStats();
  const { data: todayWorkout } = useTodayWorkout();

  return (
    <AppShell>
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Hola, {user?.name?.split(' ')[0]} 👋</h4>
        <p className="text-muted small mb-0">
          {todayWorkout
            ? todayWorkout.status === 'COMPLETED'
              ? '✅ Entrenamiento de hoy completado'
              : '🔥 Entrenamiento en curso...'
            : 'Hoy no entrenaste todavía'}
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : stats ? (
        <>
          <div className="row g-3 mb-4">
            <div className="col-6">
              <MetricCard
                label="Racha actual"
                value={stats.currentStreak}
                unit="días"
                icon={<Flame size={18} />}
                highlight={stats.currentStreak > 0}
              />
            </div>
            <div className="col-6">
              <MetricCard
                label="Volumen semanal"
                value={formatVolume(stats.weeklyVolumeKg)}
                icon={<Activity size={18} />}
              />
            </div>
            <div className="col-6">
              <MetricCard
                label="Total workouts"
                value={stats.totalWorkouts}
                icon={<Dumbbell size={18} />}
              />
            </div>
            <div className="col-6">
              <MetricCard
                label="Racha máxima"
                value={stats.longestStreak}
                unit="días"
                icon={<TrendingUp size={18} />}
              />
            </div>
          </div>

          {stats.favoriteExercise && (
            <div className="alert alert-light border small mb-4">
              💪 Tu ejercicio favorito: <strong>{stats.favoriteExercise}</strong>
            </div>
          )}
        </>
      ) : null}

      {/* Quick actions */}
      <div className="d-grid gap-2">
        <Link to="/workout" className="btn btn-primary btn-action">
          <Dumbbell size={18} className="me-2" />
          {todayWorkout ? 'Continuar entrenamiento' : 'Iniciar entrenamiento'}
        </Link>
        <Link to="/progress" className="btn btn-outline-secondary btn-action">
          <TrendingUp size={18} className="me-2" />
          Ver progreso
        </Link>
      </div>
    </AppShell>
  );
}
