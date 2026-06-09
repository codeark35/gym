import MetricCard from '../../../components/ui/MetricCard';
import type { Stats } from '../../../types/workout.types';
import { Flame, Dumbbell, TrendingUp, Activity, Calendar } from 'lucide-react';
import { formatVolume } from '../../../utils/volume.utils';

interface StatsGridProps {
  stats: Stats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="row g-3">
      <div className="col-6">
        <MetricCard
          label="Total workouts"
          value={stats.totalWorkouts}
          icon={<Dumbbell size={18} />}
        />
      </div>
      <div className="col-6">
        <MetricCard
          label="Racha actual"
          value={stats.currentStreak}
          unit="días"
          icon={<Flame size={18} />}
          highlight={stats.currentStreak > 2}
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
      <div className="col-6">
        <MetricCard
          label="Vol. semanal"
          value={formatVolume(stats.weeklyVolumeKg)}
          icon={<Activity size={18} />}
        />
      </div>
      <div className="col-6">
        <MetricCard
          label="Ejercicios únicos"
          value={stats.uniqueExercises}
          icon={<Calendar size={18} />}
        />
      </div>
    </div>
  );
}
