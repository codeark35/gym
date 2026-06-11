import { useState } from 'react';
import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  type NotificationSettings,
} from '../../notifications/hooks/useNotifications';
import { Bell, Brain, AlertTriangle, Dumbbell, Trophy } from 'lucide-react';

export default function SettingsPage() {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    updateSettings.mutate({ [key]: !settings[key] }, {
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
      description: 'Recibí notificaciones inmediatas cuando lográs un nuevo record personal.',
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

      {/* Notification settings */}
      <div className="card mb-4" style={{ border: 'none', borderRadius: 16 }}>
        <div className="card-header py-3 d-flex align-items-center gap-2" style={{ borderRadius: '16px 16px 0 0' }}>
          <Bell size={18} style={{ color: '#fbbf24' }} />
          <span className="fw-semibold">Notificaciones de IA</span>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-4 d-flex justify-content-center">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <>
              {items.map((item) => {
                const enabled = settings?.[item.key] ?? true;
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className="d-flex align-items-center gap-3 p-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
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
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={enabled}
                        onChange={() => handleToggle(item.key)}
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
