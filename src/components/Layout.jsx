import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/', label: '대시보드' },
  { to: '/plan', label: '월별 계획' },
  { to: '/savings', label: '적금 관리' },
  { to: '/asset', label: '총자산' },
  { to: '/emergency', label: '비상금' },
];

export default function Layout() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <h1 className="sidebar-title">가계부</h1>
        <ul className="nav-list">
          {NAV_ITEMS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
