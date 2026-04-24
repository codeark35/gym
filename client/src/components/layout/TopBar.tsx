import { Dumbbell, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-light bg-white border-bottom sticky-top">
      <div className="container-fluid">
        <span className="navbar-brand d-flex align-items-center gap-2 fw-bold">
          <Dumbbell size={22} />
          GymTracker Pro
        </span>
        {user && (
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted d-none d-sm-inline">{user.name}</span>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
