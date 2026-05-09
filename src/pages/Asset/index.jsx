import { useEffect, useState } from 'react';
import { getAssets } from '../../api/asset';

export default function Asset() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAssets()
      .then((res) => setAssets(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>불러오는 중...</p>;
  if (error) return <p>오류: {error}</p>;

  return (
    <div>
      <h2>총자산 현황</h2>
      {assets.length === 0 ? (
        <p>등록된 자산이 없습니다.</p>
      ) : (
        <pre>{JSON.stringify(assets, null, 2)}</pre>
      )}
    </div>
  );
}
