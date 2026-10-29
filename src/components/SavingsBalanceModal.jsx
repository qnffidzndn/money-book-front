import { useState } from 'react';
import Modal from './Modal';
import { createSaving, updateSaving } from '../api/savings';
import { formatNumberInput, parseNumberInput } from '../utils/format';

export default function SavingsBalanceModal({ master, account, memberId, ym, onClose, onSaved }) {
  const isEdit = !!account?.id;
  const [paymentAmount, setPaymentAmount] = useState(account?.paymentAmount ? formatNumberInput(account.paymentAmount) : '');

  const handleChange = (e) => {
    setPaymentAmount(formatNumberInput(e.target.value));
  };

  const handleSave = () => {
    if (!paymentAmount) return alert('잔액을 입력해주세요.');
    const payload = { savingsMasterId: master.id, memberId, ym, paymentAmount: Number(parseNumberInput(paymentAmount)) };
    const request = isEdit ? updateSaving(account.id, payload) : createSaving(payload);
    request.then(() => onSaved()).catch(() => alert('저장에 실패했습니다.'));
  };

  return (
    <Modal title={isEdit ? '잔액 수정' : '잔액 입력'} onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">{master.name} · {master.bank}</label>
          <input
            className="form-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={paymentAmount}
            onChange={handleChange}
            autoFocus
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
