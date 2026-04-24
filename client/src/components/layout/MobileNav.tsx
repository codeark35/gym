import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, TrendingUp, BarChart2, User } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard },
  { to: '/workout', label: 'Entreno', icon: Dumbbell },
  { to: '/progress', label: 'Progreso', icon: TrendingUp },
  { to: '/stats', label: 'Stats', icon: BarChart2 },
  { to: '/profile', label: 'Perfil', icon: User },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="navbar fixed-bottom bg-white border-top bottom-nav d-lg-none px-1">
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
              className={`nav-link text-center flex-fill ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} />
              <div>{label}</div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
