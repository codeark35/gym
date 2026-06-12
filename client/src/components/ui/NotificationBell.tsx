import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useUnreadCount, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../features/notifications/hooks/useNotifications';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationBell() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { data: count } = useUnreadCount();
  const { data: notifications } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = count ?? 0;
  const recentNotifications = notifications?.slice(0, 5) ?? [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'OVERTRAINING': return '#ef4444';
      case 'PR': return '#fbbf24';
      case 'SUGGESTION': return '#38bdf8';
      case 'ROUTINE': return '#a78bfa';
      default: return '#94a3b8';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERTRAINING': return '⚠️';
      case 'PR': return '🏆';
      case 'SUGGESTION': return '💡';
      case 'ROUTINE': return '📋';
      default: return '📢';
    }
  };

  return (
    <div className="position-relative">
      <button
        className="btn btn-link text-white position-relative p-2"
        onClick={() => setShow(!show)}
        style={{ textDecoration: 'none' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{ background: '#ef4444', fontSize: '0.6rem', padding: '0.25em 0.5em' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {show && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1040 }}
            onClick={() => setShow(false)}
          />
          <div
            className="position-absolute end-0 mt-2"
            style={{
              width: 'min(100vw - 24px, 320px)',
              maxHeight: 'min(75vh, 400px)',
              zIndex: 1050,
              background: 'linear-gradient(135deg, #0f172a, #1e293b)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}
          >
            <div className="d-flex align-items-center justify-content-between p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="fw-semibold text-white small">Notificaciones</span>
              <div className="d-flex gap-2">
                {unreadCount > 0 && (
                  <button
                    className="btn btn-link text-white-50 p-0"
                    style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                    onClick={() => markAllAsRead.mutate()}
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ maxHeight: 'min(60vh, 320px)', overflowY: 'auto' }}>
              {recentNotifications.length === 0 ? (
                <div className="p-4 text-center text-white-50 small">
                  Sin notificaciones
                </div>
              ) : (
                recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="d-flex align-items-start gap-2 p-3"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      background: n.readAt ? 'transparent' : 'rgba(67, 56, 202, 0.08)',
                    }}
                    onClick={() => {
                      if (!n.readAt) markAsRead.mutate(n.id);
                      navigate('/ai', { state: { notification: { id: n.id, type: n.type, title: n.title, message: n.message } } });
                      setShow(false);
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{getTypeIcon(n.type)}</span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-white small" style={{ fontSize: '0.8125rem' }}>{n.title}</span>
                        {!n.readAt && (
                          <span
                            className="rounded-circle flex-shrink-0"
                            style={{ width: 6, height: 6, background: getTypeColor(n.type) }}
                          />
                        )}
                      </div>
                      <p className="text-white-50 mb-0" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {n.message.slice(0, 80)}{n.message.length > 80 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications && notifications.length > 0 && (
              <div className="p-2 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  className="btn btn-link text-white-50 p-1"
                  style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                  onClick={() => { navigate('/notifications'); setShow(false); }}
                >
                  Ver todas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
