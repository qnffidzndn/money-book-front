import { useEffect, useState } from 'react';
import AssetModal from '../../components/AssetModal';
import { getAssets, getAssetTypes } from '../../api/asset';
import { formatWon } from '../../utils/format';
import useMembers from '../../hooks/useMembers';
import './Asset.css';


export default function Asset() {
  const { members } = useMembers();

  const [assets1, setAssets1] = useState([]);
  const [assets2, setAssets2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [memberIds, setMemberIds] = useState([]);

  const [memberFilter, setMemberFilter] = useState('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const [assetTypes, setAssetTypes] = useState([]);

  const [modal, setModal] = useState(null);

  useEffect(() => {
    getAssetTypes().then((r) => setAssetTypes(r.data?.data ?? [])).catch(() => {});
  }, []);

  // 멤버 ID를 한 번만 고정
  useEffect(() => {
    if (members.length > 0 && memberIds.length === 0) {
      setMemberIds(members.map((m) => m.id));
    }
  }, [members]);

  // 자산 조회: memberIds 확정 후 + refreshKey 변경 시 실행
  useEffect(() => {
    if (!memberIds.length) return;
    setLoading(true);
    setError(null);
    Promise.all(memberIds.map((id) => getAssets(id)))
      .then(([r1, r2]) => {
        setAssets1(r1.data?.data ?? []);
        setAssets2(r2?.data?.data ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [memberIds, refreshKey]);

  const refresh = () => {
    setModal(null);
    setRefreshKey((k) => k + 1);
  };

  const allAssets = [
    ...(assets1.map((a) => ({ ...a, memberId: members[0]?.id, memberName: members[0]?.name }))),
    ...(assets2.map((a) => ({ ...a, memberId: members[1]?.id, memberName: members[1]?.name }))),
  ];

  const filtered = allAssets
    .filter((a) => {
      if (memberFilter !== 'all' && String(a.memberId) !== memberFilter) return false;
      if (assetTypeFilter !== 'all' && String(a.assetTypeId) !== assetTypeFilter) return false;
      return true;
    })
    .sort((a, b) => (b.assetDate ?? '').localeCompare(a.assetDate ?? ''));

  const grandTotal = allAssets.reduce((sum, a) => sum + (a.amount ?? 0), 0);
  const usedTotal = allAssets.filter((a) => (a.amount ?? 0) < 0).reduce((sum, a) => sum + (a.amount ?? 0), 0);

  const assetTypeSummary = Object.values(
    allAssets.reduce((acc, a) => {
      const id = a.assetTypeId;
      if (!id) return acc;
      if (!acc[id]) acc[id] = { assetTypeId: id, assetTypeName: a.assetTypeName, total: 0 };
      acc[id].total += a.amount ?? 0;
      return acc;
    }, {})
  ).filter((s) => s.total > 0);

  return (
    <div className="asset-page">
      {/* 총 자산 */}
      <div className="grand-total-card">
        <div className="grand-total-label">총 자산</div>
        <div className="grand-total-amount">{formatWon(grandTotal)}</div>
      </div>

      {/* 자산유형별 요약 */}
      {!loading && !error && (assetTypeSummary.length > 0 || usedTotal < 0) && (
        <div className="type-summary">
          {assetTypeSummary.map(({ assetTypeId, assetTypeName, total }) => (
            <div key={assetTypeId} className="type-card">
              <span className="type-label">{assetTypeName}</span>
              <span className="type-amount">{formatWon(total)}</span>
            </div>
          ))}
          {usedTotal < 0 && (
            <div className="type-card type-card-used">
              <span className="type-label">사용한 금액</span>
              <span className="type-amount type-amount-used">-{formatWon(Math.abs(usedTotal))}</span>
            </div>
          )}
        </div>
      )}

      {/* 필터 바 */}
      <div className="filter-bar">
        <div className="filter-controls">
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
          <select
            className="filter-select"
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value)}
          >
            <option value="all">전체 자산유형</option>
            {assetTypes.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn-add" onClick={() => setModal({ item: null })}>
            + 추가
          </button>
        </div>
      </div>

      {loading && <p className="loading-msg">불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        <section className="asset-section">
          {filtered.length === 0 ? (
            <p className="empty-msg">등록된 자산이 없습니다.</p>
          ) : (
            <table className="asset-table">
              <thead>
                <tr>
                  <th>기준일자</th>
                  <th>멤버</th>
                  <th>자산명</th>
                  <th>금액</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => (
                  <tr
                    key={asset.id}
                    className="clickable"
                    onClick={() => setModal({ item: asset })}
                  >
                    <td className="col-date">{asset.assetDate ?? '-'}</td>
                    <td className="col-member">{asset.memberName}</td>
                    <td className="col-name">{asset.assetTypeName}</td>
                    <td className={(asset.amount ?? 0) < 0 ? 'col-amount-debt' : 'col-amount'}>
                      {formatWon(asset.amount)}
                    </td>
                    <td className="col-desc">{asset.description ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {modal && (
        <AssetModal
          item={modal.item}
          members={members}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
