import { useTabs } from '../context/TabContext';
import './TabBar.css';

export default function TabBar() {
  const { tabs, activePath, switchTab, closeTab } = useTabs();

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.path}
          className={`tab-item${tab.path === activePath ? ' active' : ''}`}
          onClick={() => switchTab(tab.path)}
        >
          <span className="tab-label">{tab.label}</span>
          <span
            className="tab-close"
            onClick={(e) => closeTab(tab.path, e)}
            title="닫기"
          >
            ×
          </span>
        </div>
      ))}
    </div>
  );
}
