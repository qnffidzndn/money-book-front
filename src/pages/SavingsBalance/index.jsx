import { useEffect, useRef, useState } from 'react';
import YearMonthPicker from '../../components/YearMonthPicker';
import SavingsBalanceModal from '../../components/SavingsBalanceModal';
import SavingsModal from '../../components/SavingsModal';
import { getSavings, getSavingsMaster, getSavingsByMasterId, createSaving, deleteSaving } from '../../api/savings';
import { formatWon } from '../../utils/format';
import useMembers from '../../hooks/useMembers';
import './SavingsBalance.css';

const toYm = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export default function SavingsBalance() {
  const { members } = useMembers();
  const name1 = members[0]?.name ?? '';
  const name2 = members[1]?.name ?? '';

  const [ym, setYm] = useState(() => toYm(new Date()));
  const [masters1, setMasters1] = useState([]);
  const [masters2, setMasters2] = useState([]);
  const [accounts1, setAccounts1] = useState([]);
  const [accounts2, setAccounts2] = useState([]);
  const [cumulativeMap, setCumulativeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchName, setSearchName] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');

  const [copying, setCopying] = useState(false);
  const copyingRef = useRef(false);

  const [balanceModal, setBalanceModal] = useState(null);
  const [savingsModal, setSavingsModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getSavingsMaster(1),
      getSavingsMaster(2),
      getSavings(1, ym),
      getSavings(2, ym),
    ])
      .then(([r1, r2, r3, r4]) => {
        const m1 = r1.data?.data ?? [];
        const m2 = r2.data?.data ?? [];
        setMasters1(m1);
        setMasters2(m2);
        setAccounts1(r3.data?.data ?? []);
        setAccounts2(r4.data?.data ?? []);

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
          map[masterId] = accounts
            .filter((a) => a.ym <= ym)
            .reduce((sum, a) => sum + (a.paymentAmount ?? 0), 0);
        });
        setCumulativeMap(map);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ym, refreshKey]);

  const refresh = () => {
    setBalanceModal(null);
    setSavingsModal(null);
    setRefreshKey((k) => k + 1);
  };

  const allAccounts = [...accounts1, ...accounts2].filter((a) => a.ym === ym);
  const findAccount = (masterId) =>
    allAccounts.find((a) => a.savingsMasterId === masterId) ?? null;

  const getPrevYm = () => {
    const [year, month] = ym.split('-').map(Number);
    return toYm(new Date(year, month - 2));
  };

  const handleCopyPrev = async () => {
    if (copyingRef.current) return;
    copyingRef.current = true;
    const prev = getPrevYm();
    if (allAccounts.length > 0) {
      if (!window.confirm(`이미 ${ym}에 데이터가 있습니다. 계속 복사하시겠습니까?`)) {
        copyingRef.current = false;
        return;
      }
    }
    setCopying(true);
    try {
      const [r1, r2] = await Promise.all([getSavings(1, prev), getSavings(2, prev)]);
      const combined = [
        ...(r1.data?.data ?? []).filter((a) => a.ym === prev),
        ...(r2.data?.data ?? []).filter((a) => a.ym === prev),
      ];
      const seen = new Set();
      const prevAccounts = combined.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
      if (prevAccounts.length === 0) {
        alert(`${prev}에 데이터가 없습니다.`);
        return;
      }
      await Promise.all(
        prevAccounts.map((a) => createSaving({ savingsMasterId: a.savingsMasterId, memberId: a.memberId, ym, paymentAmount: a.paymentAmount }))
      );
      setRefreshKey((k) => k + 1);
    } catch {
      alert('복사에 실패했습니다.');
    } finally {
      copyingRef.current = false;
      setCopying(false);
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('이 항목을 삭제하시겠습니까?')) return;
    try {
      await deleteSaving(accountId);
      setAccounts1((prev) => prev.filter((a) => a.id !== accountId));
      setAccounts2((prev) => prev.filter((a) => a.id !== accountId));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const allMasters = [
    ...masters1.map((m) => ({ ...m, memberId: 1, memberName: name1 })),
    ...masters2.map((m) => ({ ...m, memberId: 2, memberName: name2 })),
  ];

  const filtered = allMasters.filter((m) => {
    if (!findAccount(m.id)) return false;
    if (searchName && !m.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (memberFilter !== 'all' && String(m.memberId) !== memberFilter) return false;
    return true;
  });

  const monthlyTotal = allMasters.reduce(
    (sum, m) => sum + (findAccount(m.id)?.paymentAmount || 0), 0
  );
  const cumulativeTotal = allMasters.reduce(
    (sum, m) => sum + (cumulativeMap[m.id] || 0), 0
  );

  return (
    <div className="balance-page">
      <YearMonthPicker ym={ym} onChange={setYm} />

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
            {members.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn-copy" onClick={handleCopyPrev} disabled={copying}>
            {copying ? '복사 중...' : '이전달 복사'}
          </button>
          <button className="btn-add" onClick={() => setSavingsModal({ memberId: null, item: null })}>
            + 추가
          </button>
        </div>
      </div>

      {loading && <p className="loading-msg">불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        <>
          <section className="balance-section">
            {filtered.length === 0 ? (
              <p className="empty-msg">조건에 맞는 적금이 없습니다.</p>
            ) : (
              <table className="balance-table">
                <thead>
                  <tr>
                    <th>적금명</th>
                    <th>은행</th>
                    <th>월납입액</th>
                    <th>이번달 납부금액</th>
                    <th>누적 납부금액</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((master) => {
                    const account = findAccount(master.id);
                    const cumulative = cumulativeMap[master.id] ?? 0;
                    return (
                      <tr key={master.id}>
                        <td>
                          <div>{master.name}</div>
                          <div className="col-member">{master.memberName}</div>
                        </td>
                        <td>{master.bankName}</td>
                        <td className="col-monthly">{formatWon(master.monthlyAmount)}</td>
                        <td className={account ? 'col-balance' : 'col-balance-empty'}>
                          {account ? formatWon(account.paymentAmount) : '-'}
                        </td>
                        <td className="col-cumulative">
                          {formatWon(cumulative)}
                        </td>
                        <td className="col-actions">
                          <button
                            className={account ? 'btn-balance-edit' : 'btn-balance-add'}
                            onClick={() =>
                              setBalanceModal({ master, account, memberId: master.memberId })
                            }
                          >
                            {account ? '수정' : '입력'}
                          </button>
                          {account && (
                            <button
                              className="btn-balance-delete"
                              onClick={() => handleDelete(account.id)}
                            >
                              삭제
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          <div className="totals-row">
            <div className="grand-total">
              <span className="grand-label">이번달 납부 합계</span>
              <span className="grand-amount">{formatWon(monthlyTotal)}</span>
            </div>
            <div className="grand-total">
              <span className="grand-label">누적 납부 합계</span>
              <span className="grand-amount">{formatWon(cumulativeTotal)}</span>
            </div>
          </div>
        </>
      )}

      {balanceModal && (
        <SavingsBalanceModal
          master={balanceModal.master}
          account={balanceModal.account}
          memberId={balanceModal.memberId}
          ym={ym}
          onClose={() => setBalanceModal(null)}
          onSaved={refresh}
        />
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
