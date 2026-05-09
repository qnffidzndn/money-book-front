import { useEffect, useState } from 'react';
import { getSummary } from '../../api/dashboard';

export default function Dashboard() {
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSummary(year, month)
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [year, month]);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div>
      <h2>{year}년 {month}월 대시보드</h2>
      {summary ? (
        <pre>{JSON.stringify(summary, null, 2)}</pre>
      ) : (
        <p>데이터가 없습니다.</p>
      )}
    </div>
  );
}
