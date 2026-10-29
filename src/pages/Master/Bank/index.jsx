import { useEffect, useState } from 'react';
import BankModal from '../../../components/BankModal';
import { getBanks } from '../../../api/bank';
import '../AssetType/AssetType.css';

export default function Bank() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getBanks()
      .then((res) => setBanks(res.data?.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const refresh = () => {
    setModal(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="master-page">
      <div className="filter-bar">
        <div />
        <button className="btn-add" onClick={() => setModal({ item: null })}>
          + 추가
        </button>
      </div>

      {loading && <p className="loading-msg">불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        <section className="master-section">
          {banks.length === 0 ? (
            <p className="empty-msg">등록된 은행이 없습니다.</p>
          ) : (
            <table className="master-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>은행코드</th>
                  <th>은행명</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {banks.map((item) => (
                  <tr key={item.id}>
                    <td className="col-id">{item.id}</td>
                    <td>{item.code}</td>
                    <td className="col-name">{item.name}</td>
                    <td className="col-action">
                      <button className="btn-edit" onClick={() => setModal({ item })}>수정</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {modal && (
        <BankModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
