import { useEffect, useState } from 'react';
import { getPlans } from '../../api/plan';

export default function Plan() {
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPlans(year, month)
      .then((res) => setPlans(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [year, month]);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div>
      <h2>{year}년 {month}월 자산 계획</h2>
      {plans.length === 0 ? (
        <p>등록된 계획이 없습니다.</p>
      ) : (
        <pre>{JSON.stringify(plans, null, 2)}</pre>
      )}
    </div>
  );
}
