import { NavLink, useNavigate } from 'react-router-dom';
import TabBar     from './TabBar';
import TabContent from './TabContent';
import { useTabs } from '../context/TabContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/',                    label: '대시보드',      end: true },
  { to: '/plan',                label: '월별 계획' },
  { to: '/savings',             label: '적금 상품',     end: true },
  { to: '/savings/balance',     label: '적금 잔액',     sub: true },
  { to: '/asset',               label: '총자산' },
  { to: '/emergency',           label: '비상금' },
  { group: true,                label: '마스터 관리' },
  { to: '/master/category',     label: '카테고리 관리', sub: true },
  { to: '/master/asset-type',   label: '자산유형 관리', sub: true },
  { to: '/master/bank',         label: '은행 관리',     sub: true },
];

export default function Layout() {
  const navigate      = useNavigate();
  const { openTab, activePath } = useTabs();

  const handleNavClick = (e, to) => {
    e.preventDefault();
    openTab(to);
    navigate(to);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <h1 className="sidebar-title">가계부</h1>
        <ul className="nav-list">
          {NAV_ITEMS.map(({ to, label, end, sub, group }) => (
            <li key={to ?? label}>
              {group ? (
                <span className="nav-group-label">{label}</span>
              ) : (
                <NavLink
                  to={to}
                  end={end}
                  onClick={(e) => handleNavClick(e, to)}
                  className={() =>
                    ['nav-link', sub && 'sub', activePath === to && 'active']
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  {label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </nav>

      <div className="right-panel">
        <TabBar />
        <main className="content">
          <TabContent />
        </main>
      </div>
    </div>
  );
}
