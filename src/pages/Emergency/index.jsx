import { useEffect, useState } from 'react';
import EmergencyModal from '../../components/EmergencyModal';
import { getEmergencyFunds } from '../../api/emergency';
import { formatWon } from '../../utils/format';
import './Emergency.css';

const currentYear = new Date().getFullYear();

export default function Emergency() {
  const [allLogs, setAllLogs] = useState([]);
  const [yearLogs, setYearLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [year, setYear] = useState(currentYear);
  const [typeFilter, setTypeFilter] = useState('all');

  const [modal, setModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    Promise.all([
      getEmergencyFunds(),
      getEmergencyFunds({ startDate, endDate }),
    ])
      .then(([r1, r2]) => {
        setAllLogs(r1.data?.data ?? []);
        setYearLogs(r2.data?.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [year, refreshKey]);

  const inYear = (log) => {
    const start = `${year}-01-01`;
    const end   = `${year}-12-31`;
    return log.date >= start && log.date <= end;
  };

  const handleSaved = (log) => {
    setModal(null);
    const exists = allLogs.some((l) => l.id === log.id);
    if (exists) {
      setAllLogs((prev) => prev.map((l) => l.id === log.id ? log : l));
      setYearLogs((prev) => prev.map((l) => l.id === log.id ? log : l));
    } else {
      setAllLogs((prev) => [...prev, log]);
      if (inYear(log)) setYearLogs((prev) => [...prev, log]);
    }
  };

  const handleDeleted = (id) => {
    setModal(null);
    setAllLogs((prev) => prev.filter((l) => l.id !== id));
    setYearLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const balance = allLogs.reduce(
    (sum, log) => (log.type === 'IN' ? sum + log.amount : sum - log.amount),
    0
  );

  const yearIn  = yearLogs.filter((l) => l.type === 'IN').reduce((s, l) => s + l.amount, 0);
  const yearOut = yearLogs.filter((l) => l.type === 'OUT').reduce((s, l) => s + l.amount, 0);
  const yearNet = yearIn - yearOut;

  const filtered = yearLogs
    .filter((log) => typeFilter === 'all' || log.type === typeFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="emergency-page">
      {/* 현재 잔액 */}
      <div className="balance-card">
        <div className="balance-label">현재 비상금 (전체 기간)</div>
        <div className={`balance-amount ${balance < 0 ? 'negative' : ''}`}>
          {formatWon(balance)}
        </div>
        <div className="year-summary">
          <div className="year-summary-item">
            <span className="year-summary-label">{year}년 입금</span>
            <span className="year-summary-value in">+{formatWon(yearIn)}</span>
          </div>
          <div className="year-summary-item">
            <span className="year-summary-label">{year}년 출금</span>
            <span className="year-summary-value out">-{formatWon(yearOut)}</span>
          </div>
          <div className="year-summary-item">
            <span className="year-summary-label">{year}년 순증감</span>
            <span className={`year-summary-value net ${yearNet >= 0 ? 'in' : 'out'}`}>
              {yearNet >= 0 ? '+' : ''}{formatWon(yearNet)}
            </span>
          </div>
        </div>
      </div>

      {/* 연도 선택 */}
      <div className="year-selector">
        <button className="year-btn" onClick={() => setYear((y) => y - 1)}>{'<'}</button>
        <span className="year-label">{year}년</span>
        <button className="year-btn" onClick={() => setYear((y) => y + 1)}>{'>'}</button>
      </div>

      {/* 필터 바 */}
      <div className="filter-bar">
        <div className="filter-controls">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="IN">입금</option>
            <option value="OUT">출금</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn-add" onClick={() => setModal({ item: null })}>
            + 등록
          </button>
        </div>
      </div>

      {loading && <p className="loading-msg">불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        <section className="log-section">
          {filtered.length === 0 ? (
            <p className="empty-msg">{year}년 내역이 없습니다.</p>
          ) : (
            <table className="log-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>유형</th>
                  <th>금액</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="clickable"
                    onClick={() => setModal({ item: log })}
                  >
                    <td className="col-date">{log.date}</td>
                    <td className={log.type === 'IN' ? 'col-in' : 'col-out'}>
                      {log.type === 'IN' ? '입금' : '출금'}
                    </td>
                    <td className={log.type === 'IN' ? 'col-amount-in' : 'col-amount-out'}>
                      {log.type === 'IN' ? '+' : '-'}{formatWon(log.amount)}
                    </td>
                    <td className="col-memo">{log.memo ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {modal && (
        <EmergencyModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
