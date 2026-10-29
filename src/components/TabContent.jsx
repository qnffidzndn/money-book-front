import Dashboard    from '../pages/Dashboard';
import Plan         from '../pages/Plan';
import Savings      from '../pages/Savings';
import SavingsBalance from '../pages/SavingsBalance';
import Asset        from '../pages/Asset';
import Emergency    from '../pages/Emergency';
import Category     from '../pages/Category';
import AssetType    from '../pages/Master/AssetType';
import Bank         from '../pages/Master/Bank';
import { useTabs }  from '../context/TabContext';

const PAGE_MAP = {
  '/':                  Dashboard,
  '/plan':              Plan,
  '/savings':           Savings,
  '/savings/balance':   SavingsBalance,
  '/asset':             Asset,
  '/emergency':         Emergency,
  '/master/category':   Category,
  '/master/asset-type': AssetType,
  '/master/bank':       Bank,
};

export default function TabContent() {
  const { tabs, activePath } = useTabs();

  return (
    <>
      {tabs.map((tab) => {
        const Page = PAGE_MAP[tab.path];
        if (!Page) return null;
        return (
          <div
            key={tab.path}
            style={{ display: tab.path === activePath ? 'block' : 'none' }}
          >
            <Page />
          </div>
        );
      })}
    </>
  );
}
