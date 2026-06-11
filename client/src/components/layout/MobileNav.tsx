import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, TrendingUp, BarChart2, User, List } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/workout', label: 'Entreno', icon: Dumbbell },
  { to: '/routines', label: 'Rutinas', icon: List },
  { to: '/progress', label: 'Progreso', icon: TrendingUp },
  { to: '/stats', label: 'Stats', icon: BarChart2 },
  { to: '/profile', label: 'Perfil', icon: User },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="navbar fixed-bottom bottom-nav d-lg-none px-1">
      <div className="container-fluid justify-content-around">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`nav-link text-center flex-fill position-relative py-2 px-1 ${isActive ? 'active' : ''}`}
              style={{
                color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                transition: 'color 0.2s',
                minWidth: 0,
              }}
            >
              {/* Active indicator line */}
              {isActive && (
                <div
                  className="position-absolute start-50 translate-middle-x"
                  style={{
                    top: 0,
                    width: 24,
                    height: 3,
                    borderRadius: '0 0 2px 2px',
                    background: '#fbbf24',
                    zIndex: 1,
                  }}
                />
              )}
              <Icon
                size={22}
                style={{
                  color: isActive ? '#fbbf24' : 'inherit',
                  strokeWidth: isActive ? 2.5 : 2,
                }}
              />
              <div
                style={{
                  fontSize: '0.625rem',
                  fontWeight: isActive ? 700 : 400,
                  marginTop: 2,
                  color: isActive ? '#fbbf24' : 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
