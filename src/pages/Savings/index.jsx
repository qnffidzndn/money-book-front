import { useEffect, useState } from 'react';
import SavingsModal from '../../components/SavingsModal';
import { getSavingsMaster, getSavingsByMasterId } from '../../api/savings';
import { formatWon } from '../../utils/format';
import useMembers from '../../hooks/useMembers';
import './Savings.css';

const today = new Date().toISOString().slice(0, 10);

const getLatestBalance = (accounts) => {
  if (!accounts.length) return null;
  return accounts.reduce((sum, a) => sum + (a.paymentAmount ?? 0), 0);
};

const SORT_COLS = [
  { key: 'name',          label: '적금명' },
  { key: 'monthlyAmount', label: '월납입액' },
  { key: 'maturityDate',  label: '만기일' },
  { key: 'balance',       label: '현재 잔액' },
  { key: 'createdAt',     label: '등록일자' },
];

function SortableTh({ colKey, label, sortKey, sortDir, onSort }) {
  const active = sortKey === colKey;
  const icon = active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';
  return (
    <th className={`sortable${active ? ' sorted' : ''}`} onClick={() => onSort(colKey)}>
      {label}<span className="sort-icon">{icon}</span>
    </th>
  );
}

export default function Savings() {
  const { members } = useMembers();
  const name1 = members[0]?.name ?? '';
  const name2 = members[1]?.name ?? '';

  const [masters1, setMasters1] = useState([]);
  const [masters2, setMasters2] = useState([]);
  const [balanceMap, setBalanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchName, setSearchName] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');
  const [maturityFilter, setMaturityFilter] = useState('all');
  const [sortKey, setSortKey] = useState('startDate');
  const [sortDir, setSortDir] = useState('desc');

  const [savingsModal, setSavingsModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getSavingsMaster(1), getSavingsMaster(2)])
      .then(([r1, r2]) => {
        const m1 = r1.data?.data ?? [];
        const m2 = r2.data?.data ?? [];
        setMasters1(m1);
        setMasters2(m2);
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
  }, [refreshKey]);

  const refresh = () => {
    setSavingsModal(null);
    setRefreshKey((k) => k + 1);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // 통합 목록
  const allMasters = [
    ...masters1.map((m) => ({ ...m, memberId: 1, memberName: name1 })),
    ...masters2.map((m) => ({ ...m, memberId: 2, memberName: name2 })),
  ];

  // 필터 적용
  const filtered = allMasters.filter((m) => {
    if (searchName && !m.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (memberFilter !== 'all' && String(m.memberId) !== memberFilter) return false;
    if (maturityFilter === 'expired') {
      if (!m.maturityDate || m.maturityDate > today) return false;
    }
    if (maturityFilter === 'active') {
      if (m.maturityDate && m.maturityDate <= today) return false;
    }
    return true;
  });

  const isExpiredFn = (m) => !!(m.maturityDate && m.maturityDate <= today);

  // 정렬 적용 (만기된 항목은 항상 아래)
  const sorted = [...filtered].sort((a, b) => {
    const aExp = isExpiredFn(a) ? 1 : 0;
    const bExp = isExpiredFn(b) ? 1 : 0;
    if (aExp !== bExp) return aExp - bExp;
    const aVal = sortKey === 'balance' ? balanceMap[a.id] : a[sortKey];
    const bVal = sortKey === 'balance' ? balanceMap[b.id] : b[sortKey];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // 합계 (전체 데이터 기준)
  const total1 = masters1.reduce((s, m) => s + (balanceMap[m.id] ?? 0), 0);
  const total2 = masters2.reduce((s, m) => s + (balanceMap[m.id] ?? 0), 0);
  const grandTotal = total1 + total2;

  const sortProps = { sortKey, sortDir, onSort: handleSort };

  return (
    <div className="savings-page">
      {/* 필터 바 */}
      <div className="filter-bar">
        <div className="filter-controls">
          <input
            className="filter-input"
            type="text"
            placeholder="적금명 검색"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <select
            className="filter-select"
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
          >
            <option value="all">전체 멤버</option>
            <option value="1">{name1}</option>
            <option value="2">{name2}</option>
          </select>
          <select
            className="filter-select"
            value={maturityFilter}
            onChange={(e) => setMaturityFilter(e.target.value)}
          >
            <option value="all">만기 전체</option>
            <option value="active">진행중</option>
            <option value="expired">만기완료</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn-add" onClick={() => setSavingsModal({ memberId: null, item: null })}>
            + 추가
          </button>
        </div>
      </div>

      {loading && <p className="loading-msg">불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        <>
          {/* 테이블 */}
          <section className="savings-section">
            {sorted.length === 0 ? (
              <p className="empty-msg">조건에 맞는 적금이 없습니다.</p>
            ) : (
              <table className="savings-table">
                <thead>
                  <tr>
                    <SortableTh colKey="name" label="적금명" {...sortProps} />
                    <th>멤버</th>
                    <th>은행</th>
                    <SortableTh colKey="monthlyAmount" label="월납입액" {...sortProps} />
                    <SortableTh colKey="startDate" label="시작일자" {...sortProps} />
                    <SortableTh colKey="maturityDate" label="만기일" {...sortProps} />
                    <th>금리</th>
                    <SortableTh colKey="balance" label="현재 잔액" {...sortProps} />
                    <th>예상이자</th>
                    <th>실제이자</th>
                    <SortableTh colKey="createdAt" label="등록일자" {...sortProps} />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((item) => {
                    const balance = balanceMap[item.id];
                    const isExpired = isExpiredFn(item);
                    return (
                      <tr
                        key={item.id}
                        className={['clickable', isExpired && 'row-expired'].filter(Boolean).join(' ')}
                        onClick={() => setSavingsModal({ memberId: item.memberId, item })}
                      >
                        <td>{item.name}</td>
                        <td className="col-member">{item.memberName}</td>
                        <td>{item.bankName}</td>
                        <td className="col-amount">{formatWon(item.monthlyAmount)}</td>
                        <td className="col-date">{item.startDate ?? '-'}</td>
                        <td className={isExpired ? 'col-expired' : 'col-maturity'}>
                          {item.maturityDate || '만기없음'}
                        </td>
                        <td className="col-rate">
                          {item.interestRate != null ? `${item.interestRate}%` : '-'}
                        </td>
                        <td className={balance != null ? 'col-balance' : 'col-balance-empty'}>
                          {balance != null ? formatWon(balance) : '-'}
                        </td>
                        <td className="col-interest">
                          {item.expectedInterest != null ? formatWon(item.expectedInterest) : '-'}
                        </td>
                        <td className="col-interest">
                          {item.actualInterest != null ? formatWon(item.actualInterest) : '-'}
                        </td>
                        <td className="col-date">{item.createdAt?.slice(0, 10) ?? '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          {/* 합계 */}
          <div className="totals-bar">
            <div className="total-card">
              <span className="total-label">{name1} 합계</span>
              <span className="total-value">{formatWon(total1)}</span>
            </div>
            <div className="total-card">
              <span className="total-label">{name2} 합계</span>
              <span className="total-value">{formatWon(total2)}</span>
            </div>
            <div className="total-card grand">
              <span className="total-label">전체 합계</span>
              <span className="total-value">{formatWon(grandTotal)}</span>
            </div>
          </div>
        </>
      )}

      {savingsModal && (
        <SavingsModal
          memberId={savingsModal.memberId}
          item={savingsModal.item}
          onClose={() => setSavingsModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
