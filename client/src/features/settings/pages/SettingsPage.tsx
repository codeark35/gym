import { useEffect, useState } from 'react';
import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  type NotificationSettings,
} from '../../notifications/hooks/useNotifications';
import {
  useRestDaysOfWeek,
  useUpdateRestDaysOfWeek,
} from '../../stats/hooks/useStats';
import { Bell, Brain, AlertTriangle, Dumbbell, Trophy, Moon } from 'lucide-react';

const WEEKDAYS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'M' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
];

export default function SettingsPage() {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const { data: restDays = [], isLoading: loadingRestDays } = useRestDaysOfWeek();
  const updateRestDays = useUpdateRestDaysOfWeek();
  const [saved, setSaved] = useState(false);
  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setSelectedDays(restDays);
  }, [restDays]);

  const getSettingValue = (key: keyof NotificationSettings) =>
    localSettings?.[key] ?? settings?.[key] ?? true;

  const handleToggle = (key: keyof NotificationSettings) => {
    const currentValue = getSettingValue(key);
    const updatedValue = !currentValue;

    setLocalSettings((prev) => {
      const source = prev ?? settings;
      if (!source) return prev;
      return { ...source, [key]: updatedValue };
    });

    updateSettings.mutate(
      { [key]: updatedValue },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        onError: () => {
          if (settings) setLocalSettings(settings);
        },
      },
    );
  };

  const handleDayToggle = (day: number) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(next);
    updateRestDays.mutate(next, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    });
  };

  const items: { key: keyof NotificationSettings; icon: typeof Brain; iconColor: string; title: string; description: string }[] = [
    {
      key: 'enableAISuggestions',
      icon: Brain,
      iconColor: '#38bdf8',
      title: 'Sugerencias de IA',
      description: 'La IA analiza tu historial y te envía sugerencias de entrenamiento periódicamente.',
    },
    {
      key: 'enableOvertrainingAlerts',
      icon: AlertTriangle,
      iconColor: '#ef4444',
      title: 'Alertas de sobreentrenamiento',
      description: 'Recibí alertas cuando la IA detecta posible sobreentrenamiento basado en tu volumen y frecuencia.',
    },
    {
      key: 'enableRoutineSuggestions',
      icon: Dumbbell,
      iconColor: '#a78bfa',
      title: 'Sugerencias de rutinas',
      description: 'La IA te propone nuevas rutinas basadas en tu progreso y objetivos.',
    },
    {
      key: 'enablePRNotifications',
      icon: Trophy,
      iconColor: '#fbbf24',
      title: 'Notificaciones de PRs',
      description: 'Recibí notificaciones inmediatas cuando lográs un nuevo récord personal.',
    },
  ];

  return (
    <AppShell>
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #4338ca, #1e3a5f)', borderRadius: 2 }} />
          <h5 className="fw-bold text-white mb-0">Ajustes</h5>
        </div>
        <p className="text-white-50 small mb-0">
          Personalizá tus preferencias y notificaciones
        </p>
      </div>

      {/* Rest days of week */}
      <div className="card card-dark mb-4" style={{ border: 'none', borderRadius: 16 }}>
        <div className="card-header py-3 d-flex align-items-center gap-2" style={{ borderRadius: '16px 16px 0 0', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Moon size={18} style={{ color: '#94a3b8' }} />
          <span className="fw-semibold text-white">Días de descanso semanales</span>
        </div>
        <div className="card-body p-3">
          <p className="text-white-50 small mb-3">
            Marcá los días de la semana que siempre descansás. Se mostrarán automáticamente en tu actividad semanal.
          </p>
          {loadingRestDays ? (
            <div className="d-flex justify-content-center py-2">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div className="d-flex gap-2 justify-content-center">
              {WEEKDAYS.map(({ value, label }) => {
                const active = selectedDays.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    className="btn fw-bold"
                    onClick={() => handleDayToggle(value)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: active ? '2px solid #94a3b8' : '2px solid rgba(255,255,255,0.1)',
                      background: active ? 'rgba(148, 163, 184, 0.2)' : 'transparent',
                      color: active ? '#e2e8f0' : '#64748b',
                      transition: 'all 0.2s ease',
                      fontSize: '0.875rem',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
          <div className="text-white-50 small mt-2 text-center">
            {selectedDays.length === 0
              ? 'Sin días fijos de descanso'
              : `Descansás ${selectedDays.length} día${selectedDays.length > 1 ? 's' : ''} por semana`}
          </div>
        </div>
      </div>

      {/* Notification settings */}
      <div className="card card-dark mb-4" style={{ border: 'none', borderRadius: 16 }}>
        <div className="card-header py-3 d-flex align-items-center gap-2" style={{ borderRadius: '16px 16px 0 0', background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Bell size={18} style={{ color: '#fbbf24' }} />
          <span className="fw-semibold text-white">Notificaciones de IA</span>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-4 d-flex justify-content-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <>
              {items.map((item) => {
                const enabled = getSettingValue(item.key);
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className="d-flex align-items-center gap-3 p-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                    onClick={() => handleToggle(item.key)}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 40, height: 40, background: `${item.iconColor}15`, border: `1px solid ${item.iconColor}30` }}
                    >
                      <Icon size={18} style={{ color: item.iconColor }} />
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-white small">{item.title}</div>
                      <div className="text-white-50" style={{ fontSize: '0.75rem' }}>{item.description}</div>
                    </div>
                    <div className="form-check form-switch m-0">
                      <input
                        id={`notification-${item.key}`}
                        className="form-check-input"
                        type="checkbox"
                        checked={enabled}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleToggle(item.key)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`notification-${item.key}`}
                        aria-label={item.title}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {saved && (
        <div
          className="position-fixed bottom-0 start-0 end-0 p-3 text-center"
          style={{ zIndex: 1100 }}
        >
          <div
            className="d-inline-block px-4 py-2 fw-semibold"
            style={{
              background: 'linear-gradient(135deg, #4338ca, #1e3a5f)',
              borderRadius: 20,
              color: '#fff',
              fontSize: '0.875rem',
            }}
          >
            Cambios guardados
          </div>
        </div>
      )}
    </AppShell>
  );
}
