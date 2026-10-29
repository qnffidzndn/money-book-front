import { useState } from 'react';
import Modal from './Modal';
import { createCategory, updateCategory, deleteCategory } from '../api/category';

const TYPE_LABEL = { EXPENSE: '지출', SAVINGS: '저축', DEPOSIT: '적금' };
const TYPE_ORDER = ['EXPENSE', 'SAVINGS', 'DEPOSIT'];

export default function CategoryModal({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [name, setName] = useState(item?.name ?? '');
  const [type, setType] = useState(item?.type ?? '');

  const handleSave = () => {
    if (!name.trim() || !type) return alert('이름과 타입을 입력해주세요.');
    const payload = { name: name.trim(), type };
    const request = isEdit ? updateCategory(item.id, payload) : createCategory(payload);
    request.then(() => onSaved()).catch(() => alert('저장에 실패했습니다.'));
  };

  const handleDelete = () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    deleteCategory(item.id)
      .then(() => onSaved())
      .catch(() => alert('삭제에 실패했습니다.'));
  };

  return (
    <Modal title={isEdit ? '카테고리 수정' : '카테고리 추가'} onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">타입</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">타입 선택</option>
            {TYPE_ORDER.map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">카테고리명</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 생활비"
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
