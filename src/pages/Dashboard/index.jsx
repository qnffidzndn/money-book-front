import { useEffect, useState } from 'react';
import { getSavingsMaster, getSavingsByMasterId } from '../../api/savings';
import { getEmergencyFunds } from '../../api/emergency';
import { formatWon } from '../../utils/format';
import useMembers from '../../hooks/useMembers';
import './Dashboard.css';

const today = new Date().toISOString().slice(0, 10);

const getLatestBalance = (accounts) => {
  if (!accounts.length) return null;
  const latest = accounts.reduce((max, item) => item.ym > max.ym ? item : max);
  return latest.paymentAmount ?? 0;
};

function MemberGroup({ memberName, items, balanceMap }) {
  if (!items.length) return null;
  return (
    <div className="member-group">
      <div className="member-group-label">{memberName}</div>
      {items.map((m) => {
        const bal = balanceMap[m.id];
        return (
          <div key={m.id} className="asset-row">
            <span className="asset-name">{m.name}</span>
            <span className={bal != null ? 'asset-balance' : 'asset-balance-empty'}>
              {bal != null ? formatWon(bal) : '-'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AssetSection({ title, items, balanceMap, total, name1, name2 }) {
  const group1 = items.filter((m) => m.memberId === 1);
  const group2 = items.filter((m) => m.memberId === 2);

  return (
    <section className="asset-section">
      <div className="section-header">
        <h3 className="section-title">{title}</h3>
        <span className="section-total">{formatWon(total)}</span>
      </div>
      <div className="section-body">
        {items.length === 0 ? (
          <p className="empty-msg">항목이 없습니다.</p>
        ) : (
          <>
            <MemberGroup memberName={name1} items={group1} balanceMap={balanceMap} />
            <MemberGroup memberName={name2} items={group2} balanceMap={balanceMap} />
          </>
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { members } = useMembers();
  const name1 = members[0]?.name ?? '';
  const name2 = members[1]?.name ?? '';

  const [masters1, setMasters1] = useState([]);
  const [masters2, setMasters2] = useState([]);
  const [balanceMap, setBalanceMap] = useState({});
  const [emergencyBalance, setEmergencyBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getSavingsMaster(1), getSavingsMaster(2), getEmergencyFunds()])
      .then(([r1, r2, r3]) => {
        const m1 = r1.data?.data ?? [];
        const m2 = r2.data?.data ?? [];
        setMasters1(m1);
        setMasters2(m2);

        const logs = r3.data?.data ?? [];
        const emergency = logs.reduce(
          (sum, log) => (log.type === 'IN' ? sum + log.amount : sum - log.amount),
          0
        );
        setEmergencyBalance(emergency);

        return Promise.all(
          [...m1, ...m2].map((m) =>
            getSavingsByMasterId(m.id)
              .then((r) => ({ masterId: m.id, accounts: r.data?.data ?? [] }))
          )
        );
      })
      .then((results) => {
        const map = {};
        results.forEach(({ masterId, accounts }) => {
          map[masterId] = getLatestBalance(accounts);
        });
        setBalanceMap(map);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const allMasters = [
    ...masters1.map((m) => ({ ...m, memberId: 1, memberName: name1 })),
    ...masters2.map((m) => ({ ...m, memberId: 2, memberName: name2 })),
  ];

  const activeSavings = allMasters.filter((m) => m.maturityDate && m.maturityDate > today);
  const parkingSavings = allMasters.filter((m) => !m.maturityDate);

  const activeTotal = activeSavings.reduce((sum, m) => sum + (balanceMap[m.id] ?? 0), 0);
  const parkingTotal = parkingSavings.reduce((sum, m) => sum + (balanceMap[m.id] ?? 0), 0);
  const grandTotal = activeTotal + parkingTotal + emergencyBalance;

  return (
    <div className="dashboard-page">
      <div className="grand-total-card">
        <div className="grand-total-label">총자산</div>
        <div className="grand-total-amount">{formatWon(grandTotal)}</div>
        <div className="grand-total-breakdown">
          <span>적금 {formatWon(activeTotal + parkingTotal)}</span>
          <span className="breakdown-sep">+</span>
          <span>비상금 {formatWon(emergencyBalance)}</span>
        </div>
      </div>

      {loading && <p className="loading-msg">불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        <>
          <AssetSection
            title="진행중 적금"
            items={activeSavings}
            balanceMap={balanceMap}
            total={activeTotal}
            name1={name1}
            name2={name2}
          />
          <AssetSection
            title="파킹통장 / 자유적금"
            items={parkingSavings}
            balanceMap={balanceMap}
            total={parkingTotal}
            name1={name1}
            name2={name2}
          />
          <section className="asset-section">
            <div className="section-header">
              <h3 className="section-title">비상금</h3>
              <span className="section-total">{formatWon(emergencyBalance)}</span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
