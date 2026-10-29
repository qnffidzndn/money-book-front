import { useEffect, useState } from 'react';
import Modal from './Modal';
import { getCategories } from '../api/category';
import { createPlan, updatePlan, deletePlan } from '../api/plan';
import { formatNumberInput, parseNumberInput } from '../utils/format';

const TYPE_LABEL = { EXPENSE: '지출', SAVINGS: '저축', DEPOSIT: '적금' };
const TYPE_ORDER = ['EXPENSE', 'SAVINGS', 'DEPOSIT'];

export default function PlanModal({ memberId, ym, item, onClose, onSaved }) {
  const isEdit = !!item;
  const [categories, setCategories] = useState([]);
  const [categoryType, setCategoryType] = useState('');
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? '');
  const [amount, setAmount] = useState(item?.plannedAmount ? formatNumberInput(item.plannedAmount) : '');

  useEffect(() => {
    getCategories()
      .then((res) => {
        const cats = res.data?.data ?? [];
        setCategories(cats);
        if (item?.categoryId) {
          const found = cats.find((c) => c.id === item.categoryId);
          if (found) setCategoryType(found.type);
        }
      })
      .catch(() => {});
  }, []);

  const handleTypeChange = (e) => {
    setCategoryType(e.target.value);
    setCategoryId('');
  };

  const filteredCategories = categoryType
    ? categories.filter((c) => c.type === categoryType)
    : [];

  const handleSave = () => {
    if (!categoryId || !amount) return alert('카테고리와 금액을 입력해주세요.');
    const payload = { memberId, yearMonth: ym, categoryId: Number(categoryId), plannedAmount: Number(parseNumberInput(amount)) };
    const request = isEdit ? updatePlan(item.id, payload) : createPlan(payload);
    request.then(() => onSaved()).catch(() => alert('저장에 실패했습니다.'));
  };

  const handleDelete = () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    deletePlan(item.id)
      .then(() => onSaved())
      .catch(() => alert('삭제에 실패했습니다.'));
  };

  return (
    <Modal title={isEdit ? '지출 계획 수정' : '지출 계획 추가'} onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">타입</label>
          <select
            className="form-select"
            value={categoryType}
            onChange={handleTypeChange}
          >
            <option value="">타입 선택</option>
            {TYPE_ORDER.map((type) => (
              <option key={type} value={type}>{TYPE_LABEL[type]}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">카테고리</label>
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!categoryType}
          >
            <option value="">카테고리 선택</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">금액 (원)</label>
          <input
            className="form-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(formatNumberInput(e.target.value))}
          />
        </div>
        <div className="modal-actions">
          {isEdit && <button className="btn-danger" onClick={handleDelete}>삭제</button>}
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button className="btn-primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    </Modal>
  );
}
