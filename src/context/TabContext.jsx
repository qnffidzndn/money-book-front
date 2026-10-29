import { createContext, useCallback, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TabContext = createContext(null);

export const LABEL_MAP = {
  '/':                   '대시보드',
  '/plan':               '월별 계획',
  '/savings':            '적금 상품',
  '/savings/balance':    '적금 잔액',
  '/asset':              '총자산',
  '/emergency':          '비상금',
  '/master/category':    '카테고리 관리',
  '/master/asset-type':  '자산유형 관리',
  '/master/bank':        '은행 관리',
};

export function TabProvider({ children }) {
  const location = useLocation();
  const navigate  = useNavigate();

  const initPath  = location.pathname;
  const initLabel = LABEL_MAP[initPath] ?? '페이지';

  const [tabs, setTabs]           = useState([{ path: initPath, label: initLabel }]);
  const [activePath, setActivePath] = useState(initPath);

  // 사이드바에서 호출 — NavLink가 이미 navigate() 하므로 여기선 상태만 변경
  const openTab = useCallback((path) => {
    const label = LABEL_MAP[path] ?? path;
    setTabs((prev) =>
      prev.find((t) => t.path === path) ? prev : [...prev, { path, label }]
    );
    setActivePath(path);
  }, []);

  // 탭 클릭 — URL 이동 포함
  const switchTab = useCallback((path) => {
    setActivePath(path);
    navigate(path);
  }, [navigate]);

  // 탭 닫기
  const closeTab = useCallback((path, e) => {
    e?.stopPropagation();
    setTabs((prev) => {
      const idx  = prev.findIndex((t) => t.path === path);
      const next = prev.filter((t) => t.path !== path);

      if (next.length === 0) {
        setActivePath('/');
        navigate('/');
        return [{ path: '/', label: '대시보드' }];
      }

      if (path === activePath) {
        const newActive = next[Math.min(idx, next.length - 1)];
        setActivePath(newActive.path);
        navigate(newActive.path);
      }

      return next;
    });
  }, [activePath, navigate]);

  return (
    <TabContext.Provider value={{ tabs, activePath, openTab, switchTab, closeTab }}>
      {children}
    </TabContext.Provider>
  );
}

export const useTabs = () => useContext(TabContext);
