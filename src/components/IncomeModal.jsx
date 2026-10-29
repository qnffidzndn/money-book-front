import { useState } from 'react';
import Modal from './Modal';
import { createIncome, updateIncome } from '../api/income';
import { formatNumberInput, parseNumberInput } from '../utils/format';

export default function IncomeModal({ memberId, ym, income, onClose, onSaved }) {
  const isEdit = !!income?.id;
  const [amount, setAmount] = useState(income?.amount ? formatNumberInput(income.amount) : '');

  const handleAmountChange = (e) => {
    setAmount(formatNumberInput(e.target.value));
  };

  const handleSave = () => {
    if (!amount) return alert('금액을 입력해주세요.');
    const payload = { memberId, yearMonth: ym, amount: Number(parseNumberInput(amount)) };
    const request = isEdit
      ? updateIncome(income.id, payload)
      : createIncome(payload);
    request.then(() => onSaved()).catch(() => alert('저장에 실패했습니다.'));
  };

  return (
    <Modal title="월급 수정" onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">금액 (원)</label>
          <input
            className="form-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={handleAmountChange}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button className="btn-primary" onClick={handleSave}>저장</button>
        </div>
      </div>
    </Modal>
  );
}
