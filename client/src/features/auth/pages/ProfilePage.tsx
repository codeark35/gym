import AppShell from '../../../components/layout/AppShell';
import { useAuth } from '../../../hooks/useAuth';
import { useSubscription } from '../../../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, CreditCard, Bot } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { plan } = useSubscription();
  const navigate = useNavigate();

  const planLabels = { FREE: 'Gratuito', PRO: 'Pro', GYM: 'Gym' };
  const planColors = { FREE: 'secondary', PRO: 'primary', GYM: 'warning' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell>
      <div className="text-center mb-4">
        <div
          className="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center mb-2"
          style={{ width: 72, height: 72, fontSize: '1.75rem' }}
        >
          {user?.name?.[0]?.toUpperCase() ?? <User size={32} />}
        </div>
        <h5 className="fw-bold mb-0">{user?.name}</h5>
        <p className="text-muted small mb-2">{user?.email}</p>
        <span className={`badge bg-${planColors[plan as keyof typeof planColors]}`}>
          Plan {planLabels[plan as keyof typeof planLabels]}
        </span>
      </div>

      <div className="list-group mb-4">
        <button className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3" onClick={() => navigate('/ai')}>
          <Bot size={18} className="text-primary" />
          <span>Análisis con IA</span>
        </button>
        <button className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3">
          <CreditCard size={18} className="text-success" />
          <span>Gestionar suscripción</span>
        </button>
        <button
          className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 text-danger"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </AppShell>
  );
}
