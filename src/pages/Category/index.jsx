import { useEffect, useState } from 'react';
import CategoryModal from '../../components/CategoryModal';
import { getCategories } from '../../api/category';
import './Category.css';

const TYPE_LABEL = { EXPENSE: '지출', SAVINGS: '저축', DEPOSIT: '적금' };
const TYPE_ORDER = ['EXPENSE', 'SAVINGS', 'DEPOSIT'];

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCategories()
      .then((res) => setCategories(res.data?.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const refresh = () => {
    setModal(null);
    setRefreshKey((k) => k + 1);
  };

  const filtered = typeFilter === 'all'
    ? categories
    : categories.filter((c) => c.type === typeFilter);

  const grouped = TYPE_ORDER.reduce((acc, type) => {
    const items = filtered.filter((c) => c.type === type);
    if (items.length) acc[type] = items;
    return acc;
  }, {});

  return (
    <div className="category-page">
      <div className="filter-bar">
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">전체 타입</option>
          {TYPE_ORDER.map((t) => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
        <button className="btn-add" onClick={() => setModal({ item: null })}>
          + 추가
        </button>
      </div>

      {loading && <p className="loading-msg">불러오는 중...</p>}
      {error && <p className="error-msg">오류: {error}</p>}

      {!loading && !error && (
        filtered.length === 0 ? (
          <p className="empty-msg">카테고리가 없습니다.</p>
        ) : (
          Object.entries(grouped).map(([type, items]) => (
            <section key={type} className="category-section">
              <div className="section-header">
                <h3 className="section-title">{TYPE_LABEL[type]}</h3>
                <span className="section-count">{items.length}개</span>
              </div>
              <div className="category-list">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="category-row clickable"
                    onClick={() => setModal({ item })}
                  >
                    <span className="category-name">{item.name}</span>
                    <span className="category-edit-hint">수정 →</span>
                  </div>
                ))}
              </div>
            </section>
          ))
        )
      )}

      {modal && (
        <CategoryModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
