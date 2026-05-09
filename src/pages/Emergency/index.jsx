import { useEffect, useState } from 'react';
import { getEmergencyFunds } from '../../api/emergency';

export default function Emergency() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getEmergencyFunds()
      .then((res) => setFunds(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div>
      <h2>비상금 내역</h2>
      {funds.length === 0 ? (
        <p>등록된 비상금 내역이 없습니다.</p>
      ) : (
        <pre>{JSON.stringify(funds, null, 2)}</pre>
      )}
    </div>
  );
}
