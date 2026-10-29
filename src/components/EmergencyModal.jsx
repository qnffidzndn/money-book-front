import { useEffect, useState } from 'react';
import Modal from './Modal';
import { createEmergencyFund, updateEmergencyFund, deleteEmergencyFund } from '../api/emergency';
import { formatNumberInput, parseNumberInput } from '../utils/format';

const today = new Date().toISOString().slice(0, 10);

export default function EmergencyModal({ item, onClose, onSaved, onDeleted }) {
  const isEdit = !!item;
  const [date, setDate] = useState(item?.date ?? today);
  const [type, setType] = useState(item?.type ?? 'IN');
  const [amount, setAmount] = useState(item?.amount ? formatNumberInput(item.amount) : '');
  const [memo, setMemo] = useState(item?.memo ?? '');

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [date, type, amount, memo]);

  const handleSave = () => {
    if (!date || !amount) return alert('날짜와 금액을 입력해주세요.');
    const payload = { date, type, amount: Number(parseNumberInput(amount)), memo: memo || null };
    const request = isEdit
      ? updateEmergencyFund(item.id, payload)
      : createEmergencyFund(payload);
    request
      .then((res) => onSaved(res.data?.data ?? { ...payload, id: item?.id }))
      .catch(() => alert('저장에 실패했습니다.'));
  };

  const handleDelete = () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    deleteEmergencyFund(item.id)
      .then(() => onDeleted(item.id))
      .catch(() => alert('삭제에 실패했습니다.'));
  };

  return (
    <Modal title={isEdit ? '비상금 수정' : '비상금 등록'} onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">날짜</label>
          <input
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">유형</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="IN">입금</option>
            <option value="OUT">출금</option>
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
        <div className="form-group">
          <label className="form-label">메모 (선택)</label>
          <input
            className="form-input"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
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
