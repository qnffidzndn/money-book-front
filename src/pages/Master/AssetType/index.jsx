import { useEffect, useState } from 'react';
import AssetTypeModal from '../../../components/AssetTypeModal';
import { getAssetTypes } from '../../../api/asset';
import './AssetType.css';

export default function AssetType() {
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAssetTypes()
      .then((res) => setAssetTypes(res.data?.data ?? []))
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
          {assetTypes.length === 0 ? (
            <p className="empty-msg">자산유형이 없습니다.</p>
          ) : (
            <table className="master-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>자산명</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assetTypes.map((item) => (
                  <tr key={item.id}>
                    <td className="col-id">{item.id}</td>
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
        <AssetTypeModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
