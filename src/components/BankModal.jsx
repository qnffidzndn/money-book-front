import { useState } from 'react';
import Modal from './Modal';
import { createBank, updateBank, deleteBank } from '../api/bank';

export default function BankModal({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [code, setCode] = useState(item?.code ?? '');
  const [name, setName] = useState(item?.name ?? '');

  const handleSave = () => {
    if (!code.trim() || !name.trim()) return alert('은행코드와 은행명을 입력해주세요.');
    const payload = { code: code.trim(), name: name.trim() };
    const request = isEdit ? updateBank(item.id, payload) : createBank(payload);
    request.then(() => onSaved()).catch(() => alert('저장에 실패했습니다.'));
  };

  const handleDelete = () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    deleteBank(item.id)
      .then(() => onSaved())
      .catch(() => alert('삭제에 실패했습니다.'));
  };

  return (
    <Modal title={isEdit ? '은행 수정' : '은행 추가'} onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">은행코드</label>
          <input
            className="form-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예: 004"
          />
        </div>
        <div className="form-group">
          <label className="form-label">은행명</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 국민은행"
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
