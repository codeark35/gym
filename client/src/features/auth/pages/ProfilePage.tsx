import AppShell from '../../../components/layout/AppShell';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Bot, Settings, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div style={{ width: 4, height: 20, background: 'linear-gradient(to bottom, #4338ca, #1e3a5f)', borderRadius: 2 }} />
          <h5 className="fw-bold text-white mb-0">Perfil</h5>
        </div>
      </div>

      {/* Profile card */}
      <div className="card mb-4" style={{ border: 'none', borderRadius: 20, overflow: 'hidden' }}>
        <div
          className="card-body p-4 text-center position-relative"
          style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
        >
          {/* Decorative glow */}
          <div
            className="position-absolute"
            style={{
              top: -40, right: -30,
              width: 140, height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(67, 56, 202, 0.2) 0%, transparent 70%)',
            }}
          />

          <div className="position-relative">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: 80, height: 80, fontSize: '2rem',
                background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
                boxShadow: '0 8px 20px rgba(30, 58, 95, 0.4)',
                border: '2px solid rgba(255,255,255,0.1)',
              }}
            >
              {user?.name?.[0]?.toUpperCase() ?? <User size={36} />}
            </div>
            <h5 className="fw-bold text-white mb-1">{user?.name}</h5>
            <p className="text-white-50 small mb-2">{user?.email}</p>
            <span
              className="badge px-3 py-1"
              style={{
                background: 'rgba(45, 106, 79, 0.2)',
                border: '1px solid rgba(45, 106, 79, 0.3)',
                color: '#34d399',
                fontSize: '0.75rem',
              }}
            >
              <Sparkles size={10} className="me-1" />
              Gratuito
            </span>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="d-flex flex-column gap-2 mb-4">
        <button
          className="btn d-flex align-items-center gap-3 py-3 px-3 text-start"
          onClick={() => navigate('/ai')}
          style={{
            borderRadius: 14,
            background: 'rgba(67, 56, 202, 0.08)',
            border: '1px solid rgba(67, 56, 202, 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 40, height: 40, background: 'rgba(67, 56, 202, 0.15)' }}
          >
            <Bot size={18} style={{ color: '#818cf8' }} />
          </div>
          <div className="flex-grow-1">
            <div className="fw-semibold text-white">Análisis con IA</div>
            <div className="small text-white-50">Consultá con tu entrenador inteligente</div>
          </div>
          <div style={{ color: '#64748b' }}>›</div>
        </button>

        <button
          className="btn d-flex align-items-center gap-3 py-3 px-3 text-start"
          onClick={() => navigate('/settings')}
          style={{
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 40, height: 40, background: 'rgba(255, 255, 255, 0.06)' }}
          >
            <Settings size={18} style={{ color: '#94a3b8' }} />
          </div>
          <div className="flex-grow-1">
            <div className="fw-semibold text-white">Ajustes</div>
            <div className="small text-white-50">Preferencias de la app</div>
          </div>
          <div style={{ color: '#64748b' }}>›</div>
        </button>
      </div>

      {/* Logout */}
      <button
        className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-3"
        onClick={handleLogout}
        style={{
          borderRadius: 14,
          background: 'rgba(220, 38, 38, 0.08)',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          color: '#f87171',
        }}
      >
        <LogOut size={18} />
        <span className="fw-semibold">Cerrar sesión</span>
      </button>
    </AppShell>
  );
}
