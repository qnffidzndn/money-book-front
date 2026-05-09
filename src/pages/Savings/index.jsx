import { useEffect, useState } from 'react';
import { getSavings } from '../../api/savings';

export default function Savings() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSavings()
      .then((res) => setSavings(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div>
      <h2>적금 관리</h2>
      {savings.length === 0 ? (
        <p>등록된 적금이 없습니다.</p>
      ) : (
        <pre>{JSON.stringify(savings, null, 2)}</pre>
      )}
    </div>
  );
}
