import { useNavigate } from 'react-router-dom';
import AppShell from '../../../components/layout/AppShell';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '../../notifications/hooks/useNotifications';
import { CheckCheck, Trash2, Brain, AlertTriangle, Dumbbell, Trophy, MessageSquare } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERTRAINING': return AlertTriangle;
      case 'PR': return Trophy;
      case 'SUGGESTION': return Brain;
      case 'ROUTINE': return Dumbbell;
      default: return MessageSquare;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'OVERTRAINING': return '#ef4444';
      case 'PR': return '#fbbf24';
      case 'SUGGESTION': return '#38bdf8';
      case 'ROUTINE': return '#a78bfa';
      default: return '#94a3b8';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'OVERTRAINING': return 'Sobreentrenamiento';
      case 'PR': return 'Record personal';
      case 'SUGGESTION': return 'Sugerencia';
      case 'ROUTINE': return 'Rutina';
      default: return 'General';
    }
  };

  return (
    <AppShell>
      <div className="mb-4">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-2">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #4338ca, #1e3a5f)', borderRadius: 2 }} />
            <h5 className="fw-bold text-white mb-0">Notificaciones</h5>
          </div>
          {notifications && notifications.some(n => !n.readAt) && (
            <button
              className="btn btn-sm btn-outline-secondary w-100 w-sm-auto"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheck size={14} className="me-1" />
              Marcar todas leídas
            </button>
          )}
        </div>
        <p className="text-white-50 small mb-0">
          Alertas y sugerencias de la IA basadas en tu entrenamiento
        </p>
      </div>

      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <LoadingSpinner />
        </div>
      ) : !notifications?.length ? (
        <div className="card" style={{ border: 'none', borderRadius: 16 }}>
          <div className="card-body p-4">
            <EmptyState
              title="Sin notificaciones"
              description="La IA generará sugerencias y alertas automáticamente a medida que entrenes."
            />
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {notifications.map((n) => {
            const Icon = getTypeIcon(n.type);
            const color = getTypeColor(n.type);
            const isUnread = !n.readAt;

            return (
              <div
                key={n.id}
                className="card"
                style={{
                  border: 'none',
                  borderRadius: 12,
                  background: isUnread ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#1e293b',
                  borderLeft: isUnread ? `3px solid ${color}` : '3px solid transparent',
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex flex-column flex-md-row align-items-start gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 40, height: 40, background: `${color}15`, border: `1px solid ${color}30` }}
                    >
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-1">
                        <span className="badge" style={{ background: `${color}20`, color, fontSize: '0.65rem', border: `1px solid ${color}40` }}>
                          {getTypeLabel(n.type)}
                        </span>
                        <span className="text-white-50" style={{ fontSize: '0.75rem' }}>
                          {new Date(n.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="fw-semibold text-white small mb-1">{n.title}</div>
                      <p className="text-white-50 mb-0" style={{ fontSize: '0.8125rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {n.message}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                    {isUnread && (
                      <button
                        className="btn btn-sm"
                        style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: 'none' }}
                        onClick={() => markAsRead.mutate(n.id)}
                      >
                        Marcar leída
                      </button>
                    )}
                    <button
                      className="btn btn-sm"
                      style={{ fontSize: '0.75rem', color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)', border: 'none' }}
                      onClick={() => navigate('/ai', { state: { notification: { id: n.id, type: n.type, title: n.title, message: n.message } } })}
                    >
                      Ver en IA
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none' }}
                      onClick={() => deleteNotification.mutate(n.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
