import { Dumbbell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="top-bar sticky-top">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        <span className="d-flex align-items-center gap-2 fw-bold text-white" style={{ fontSize: '1.125rem' }}>
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#1e3a5f',
            }}
          >
            <Dumbbell size={18} className="text-white" />
          </div>
          <span className="d-none d-sm-inline">GymTracker Pro</span>
        </span>
        {user && (
          <div className="d-flex align-items-center gap-2">
            <span className="small text-white-50 d-none d-sm-inline">{user.name}</span>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: 32,
                height: 32,
background: '#1e3a5f',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/profile')}
              title="Mi perfil"
            >
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
