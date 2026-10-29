import { useEffect, useState } from 'react';
import MonthSelector from '../../components/MonthSelector';
import PlanModal from '../../components/PlanModal';
import IncomeModal from '../../components/IncomeModal';
import { getIncome } from '../../api/income';
import { getPlans } from '../../api/plan';
import { formatWon } from '../../utils/format';
import useMembers from '../../hooks/useMembers';
import './Plan.css';

const toYm = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const sum = (items) => items.reduce((acc, item) => acc + (item.plannedAmount || 0), 0);

function PlanColumn({ name, plans, memberId, onAdd, onEdit }) {
  return (
    <div>
      <div className="column-header">
        <p className="plan-column-title">{name}</p>
        <button className="btn-add" onClick={() => onAdd(memberId)}>+ 추가</button>
      </div>
      {plans.length === 0 ? (
        <p className="empty-msg">등록된 계획이 없습니다.</p>
      ) : (
        plans.map((item) => (
          <div
            className="plan-row clickable"
            key={item.id ?? item.categoryName}
            onClick={() => onEdit(memberId, item)}
          >
            <span>{item.categoryName}</span>
            <span className="amount">{formatWon(item.plannedAmount)}</span>
          </div>
        ))
      )}
      <div className="plan-row total">
        <span>합계</span>
        <span className="amount">{formatWon(sum(plans))}</span>
      </div>
    </div>
  );
}

export default function Plan() {
  const { members } = useMembers();
  const name1 = members[0]?.name ?? '';
  const name2 = members[1]?.name ?? '';

  const [ym, setYm] = useState(() => toYm(new Date()));
  const [income1, setIncome1] = useState(null);
  const [income2, setIncome2] = useState(null);
  const [plans1, setPlans1] = useState([]);
  const [plans2, setPlans2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [planModal, setPlanModal] = useState(null);
  const [incomeModal, setIncomeModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getIncome(1, ym),
      getIncome(2, ym),
      getPlans(1, ym),
      getPlans(2, ym),
    ])
      .then(([res1, res2, res3, res4]) => {
        setIncome1(res1.data?.data?.[0] ?? null);
        setIncome2(res2.data?.data?.[0] ?? null);
        setPlans1(res3.data?.data ?? []);
        setPlans2(res4.data?.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ym, refreshKey]);

  const refresh = () => {
    setPlanModal(null);
    setIncomeModal(null);
    setRefreshKey((k) => k + 1);
  };

  const totalIncome = (income1?.amount || 0) + (income2?.amount || 0);

  return (
    <div className="plan-page">
      <MonthSelector ym={ym} onChange={setYm} />

      {loading && <p className="loading-msg">불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        <>
          {/* 월급 섹션 */}
          <section className="plan-section">
            <h3 className="section-title">월급</h3>
            <div className="income-list">
              {[
                { name: name1, income: income1, memberId: 1 },
                { name: name2, income: income2, memberId: 2 },
              ].map(({ name, income, memberId }) => (
                <div className="income-row" key={memberId}>
                  <span>{name} 월급</span>
                  <div className="income-right">
                    <span className="amount">{formatWon(income?.amount)}</span>
                    <button
                      className="btn-edit"
                      onClick={() => setIncomeModal({ memberId, income })}
                    >
                      수정
                    </button>
                  </div>
                </div>
              ))}
              <div className="income-row total">
                <span>합계</span>
                <span className="amount">{formatWon(totalIncome)}</span>
              </div>
              <div className="diff-section">
                {[
                  { name: name1, income: income1, plans: plans1 },
                  { name: name2, income: income2, plans: plans2 },
                ].map(({ name, income, plans }, i) => {
                  const diff = (income?.amount ?? 0) - sum(plans);
                  const positive = diff >= 0;
                  return (
                    <div key={i} className={`income-row ${positive ? 'diff-positive' : 'diff-negative'}`}>
                      <span>{name} 차액</span>
                      <span className="amount">
                        {positive ? '+' : ''}{formatWon(diff)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 지출 계획 섹션 */}
          <section className="plan-section">
            <h3 className="section-title">지출 계획</h3>
            <div className="plan-grid">
              <PlanColumn
                name={name1}
                plans={plans1}
                memberId={1}
                onAdd={(mid) => setPlanModal({ memberId: mid, item: null })}
                onEdit={(mid, item) => setPlanModal({ memberId: mid, item })}
              />
              <PlanColumn
                name={name2}
                plans={plans2}
                memberId={2}
                onAdd={(mid) => setPlanModal({ memberId: mid, item: null })}
                onEdit={(mid, item) => setPlanModal({ memberId: mid, item })}
              />
            </div>
          </section>
        </>
      )}

      {planModal && (
        <PlanModal
          memberId={planModal.memberId}
          ym={ym}
          item={planModal.item}
          onClose={() => setPlanModal(null)}
          onSaved={refresh}
        />
      )}
      {incomeModal && (
        <IncomeModal
          memberId={incomeModal.memberId}
          ym={ym}
          income={incomeModal.income}
          onClose={() => setIncomeModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
