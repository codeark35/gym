import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import { useStats, useWeeklyActivity, useRegisterRestDay, useTodayRestDay } from '../../stats/hooks/useStats';
import { useTodayWorkout, useWorkoutsForDate } from '../../workouts/hooks/useWorkouts';
import { todayISO } from '../../../utils/date.utils';
import {
  Dumbbell, TrendingUp, ArrowRight, Flame, CheckCircle2,
  CircleDot, Play, Zap, Target, CalendarDays, Moon, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: loadingStats, error: statsError } = useStats();
  const { data: todayWorkout } = useTodayWorkout();
  const { data: todayWorkouts } = useWorkoutsForDate(todayISO());
  const { data: weeklyActivity, isLoading: loadingWeeklyActivity, error: weeklyActivityError } = useWeeklyActivity();
  const { data: todayRestDay } = useTodayRestDay();
  const registerRestDay = useRegisterRestDay();

  useEffect(() => {
    if (statsError) {
      console.error('[Dashboard] Stats error:', statsError);
    }
    if (weeklyActivityError) {
      console.error('[Dashboard] Weekly activity error:', weeklyActivityError);
    }
    console.log('[Dashboard] Stats:', stats, 'WeeklyActivity:', weeklyActivity);
  }, [stats, statsError, weeklyActivity, weeklyActivityError]);

  const completedCount = todayWorkouts?.filter((w) => w.status === 'COMPLETED').length ?? 0;
  const hasRestDayToday = !!todayRestDay;
  const hasActiveWorkout = todayWorkout?.status === 'IN_PROGRESS';

  const todayDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  const firstName = user?.name?.split(' ')[0] ?? 'Atleta';

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const handleRestDay = () => {
    const today = todayISO();
    registerRestDay.mutate(today);
  };

  return (
    <AppShell>
      {/* ─── Header ─── */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <p className="text-white-50 mb-1 small text-uppercase" style={{ letterSpacing: 1 }}>
            {todayDate}
          </p>
          <h4 className="fw-bold text-white mb-0">
            Hola, {firstName}
          </h4>
          <div className="d-flex gap-1 mt-2">
            <div style={{ width: 24, height: 3, borderRadius: 2, background: '#f59e0b' }} />
            <div style={{ width: 12, height: 3, borderRadius: 2, background: '#1e3a5f' }} />
            <div style={{ width: 6, height: 3, borderRadius: 2, background: '#2d6a4f' }} />
          </div>
        </div>
      </div>

      {/* ─── Status Card ─── */}
      <div className="card mb-4" style={{ border: 'none', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
        {hasActiveWorkout ? (
          <div className="card-body p-0 position-relative">
            <div className="position-absolute" style={{ top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)' }} />
            <div className="d-flex align-items-center p-3 position-relative" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{ width: 48, height: 48, background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Flame size={24} style={{ color: '#fbbf24' }} />
              </div>
              <div className="text-white">
                <div className="fw-bold">Entrenamiento en curso</div>
                <div className="small text-white-50">{todayWorkout?.sets?.length ?? 0} series registradas</div>
              </div>
              <Link to="/workout" className="btn btn-sm btn-light ms-auto fw-semibold" style={{ borderRadius: 10, fontSize: '0.8125rem' }}>
                <Play size={14} className="me-1" />Continuar
              </Link>
            </div>
          </div>
        ) : completedCount > 0 ? (
          <div className="card-body p-0 position-relative">
            <div className="position-absolute" style={{ top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45, 106, 79, 0.3) 0%, transparent 70%)' }} />
            <div className="d-flex align-items-center p-3 position-relative" style={{ background: 'linear-gradient(135deg, #2d6a4f 0%, #3d7a5f 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)' }}>
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div className="text-white">
                <div className="fw-bold">{completedCount} entrenamiento{completedCount > 1 ? 's' : ''} completado{completedCount > 1 ? 's' : ''}</div>
                <div className="small text-white-50">Buen trabajo hoy</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-body p-0 position-relative">
            <div className="position-absolute" style={{ top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100, 116, 139, 0.2) 0%, transparent 70%)' }} />
            <div className="d-flex align-items-center p-3 position-relative" style={{ background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)' }}>
              <div className="d-flex align-items-center justify-content-center rounded-circle me-3" style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)' }}>
                <CircleDot size={24} className="text-white" />
              </div>
              <div className="text-white">
                <div className="fw-bold">Descanso activo</div>
                <div className="small text-white-50">Hoy no entrenaste todavía</div>
              </div>
              <Link to="/workout" className="btn btn-sm btn-light ms-auto fw-semibold" style={{ borderRadius: 10, fontSize: '0.8125rem' }}>
                <Zap size={14} className="me-1" />Empezar
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── Quick Stats Row (compact) ─── */}
      {loadingStats ? (
        <div className="d-flex justify-content-center py-3 mb-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : statsError ? (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
          <div className="card-body p-3 d-flex align-items-center gap-2">
            <AlertCircle size={18} style={{ color: '#ef4444' }} />
            <span className="text-white-50 small">Error cargando estadísticas</span>
          </div>
        </div>
      ) : stats ? (
        <div className="d-flex gap-2 mb-4">
          <Link to="/workouts" className="card card-dark flex-fill text-center py-2 text-decoration-none" style={{ border: 'none', borderRadius: 12 }}>
            <div className="fw-bold text-white" style={{ fontSize: '1.25rem' }}>{stats.totalWorkouts}</div>
            <div className="small text-white-50" style={{ fontSize: '0.6875rem' }}>Workouts</div>
          </Link>
          <div className="card card-dark flex-fill text-center py-2" style={{ border: 'none', borderRadius: 12 }}>
            <div className="fw-bold text-white" style={{ fontSize: '1.25rem' }}>{stats.currentStreak}</div>
            <div className="small text-white-50" style={{ fontSize: '0.6875rem' }}>Racha</div>
          </div>
          <div className="card card-dark flex-fill text-center py-2" style={{ border: 'none', borderRadius: 12 }}>
            <div className="fw-bold text-white" style={{ fontSize: '1.25rem' }}>{stats.uniqueExercises}</div>
            <div className="small text-white-50" style={{ fontSize: '0.6875rem' }}>Ejercicios</div>
          </div>
        </div>
      ) : (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
          <div className="card-body p-3 text-center">
            <EmptyState title="Sin datos" description="Completá tu primer entrenamiento para ver estadísticas" />
          </div>
        </div>
      )}

      {/* ─── Weekly Activity ─── */}
      {loadingStats || loadingWeeklyActivity ? (
        <div className="d-flex justify-content-center py-3 mb-4">
          <LoadingSpinner size="sm" />
        </div>
      ) : statsError || weeklyActivityError ? (
        <div className="card mb-4" style={{ border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
          <div className="card-body p-3 d-flex align-items-center gap-2">
            <AlertCircle size={18} style={{ color: '#ef4444' }} />
            <span className="text-white-50 small">Error cargando actividad semanal</span>
          </div>
        </div>
      ) : (
        <div className="card card-dark mb-4" style={{ border: 'none', borderRadius: 16 }}>
          <div className="card-body p-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 4, height: 16, background: '#2d6a4f', borderRadius: 2 }} />
                <span className="small fw-bold text-uppercase text-white-50" style={{ letterSpacing: 1, fontSize: '0.75rem' }}>
                  Actividad semanal
                </span>
              </div>
              <Link to="/stats" className="small fw-semibold text-decoration-none" style={{ color: '#38bdf8', fontSize: '0.75rem' }}>
                Ver stats →
              </Link>
            </div>
            <div className="d-flex align-items-end gap-1" style={{ height: 60 }}>
              {(weeklyActivity ?? []).map((day, i) => (
                <div key={i} className="flex-fill d-flex flex-column align-items-center gap-1">
                  <div
                    className="w-100 rounded-top"
                    style={{
                      height: `${day.intensity}%`,
                      background: day.status === 'completed' ? 'linear-gradient(to top, #2d6a4f, #34d399)' : 
                                  day.status === 'active' ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : 
                                  day.status === 'rest' ? 'linear-gradient(to top, #475569, #94a3b8)' : '#334155',
                      borderRadius: 4, minHeight: 4, transition: 'height 0.3s ease',
                    }}
                  />
                  <span className="small text-white-50" style={{ fontSize: '0.625rem' }}>{weekDays[i]}</span>
                </div>
              ))}
            </div>
            <div className="d-flex align-items-center gap-2 mt-2">
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#2d6a4f' }} />
                <span className="small text-white-50" style={{ fontSize: '0.625rem' }}>Entreno</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b' }} />
                <span className="small text-white-50" style={{ fontSize: '0.625rem' }}>Activo</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#475569' }} />
                <span className="small text-white-50" style={{ fontSize: '0.625rem' }}>Descanso</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#334155' }} />
                <span className="small text-white-50" style={{ fontSize: '0.625rem' }}>Vacío</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Favorite Exercise ─── */}
      {stats?.favoriteExercise && (
        <div className="card card-dark mb-4" style={{ border: 'none', borderRadius: 16 }}>
          <div className="card-body p-3 d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(67, 56, 202, 0.15)' }}>
              <Target size={24} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <div className="small fw-medium text-white-50">Ejercicio favorito</div>
              <div className="fw-bold text-white">{stats.favoriteExercise}</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Quick Actions ─── */}
      <div className="d-flex gap-2 mb-2">
        <Link to="/workout" className="btn btn-primary flex-fill btn-action d-flex align-items-center justify-content-center">
          <Dumbbell size={18} className="me-2" />
          {hasActiveWorkout ? 'Continuar' : 'Entrenar'}
        </Link>
        <Link to="/progress" className="btn btn-outline-light flex-fill btn-action d-flex align-items-center justify-content-center">
          <TrendingUp size={18} className="me-2" />
          Progreso
          <ArrowRight size={16} className="ms-2" />
        </Link>
      </div>
      <div className="d-flex gap-2 mb-2">
        <Link to="/workouts" className="btn btn-outline-secondary w-100 btn-action d-flex align-items-center justify-content-center">
          <CalendarDays size={18} className="me-2" />
          Ver historial de entrenamientos
        </Link>
      </div>
      {!hasActiveWorkout && completedCount === 0 && (
        <div>
          {!hasRestDayToday ? (
            <button 
              onClick={handleRestDay}
              className="btn btn-outline-info w-100 btn-action d-flex align-items-center justify-content-center"
              disabled={registerRestDay.isPending}
            >
              <Moon size={18} className="me-2" />
              {registerRestDay.isPending ? 'Registrando...' : 'Registrar día de descanso'}
            </button>
          ) : (
            <div className="d-flex align-items-center justify-content-center gap-2 py-2">
              <Moon size={16} style={{ color: '#94a3b8' }} />
              <span className="small text-white-50">
                Día de descanso registrado
              </span>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
