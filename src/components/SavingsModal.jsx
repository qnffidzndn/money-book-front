import { useEffect, useState } from 'react';
import Modal from './Modal';
import { createSavingsMaster, updateSavingsMaster, deleteSavingsMaster } from '../api/savings';
import { getMembers } from '../api/member';
import { getBanks } from '../api/bank';
import { formatNumberInput, parseNumberInput } from '../utils/format';

export default function SavingsModal({ memberId, item, onClose, onSaved }) {
  const isEdit = !!item;

  const [members, setMembers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(
    String(item?.memberId ?? memberId ?? '')
  );
  const [name, setName] = useState(item?.name ?? '');
  const [bankId, setBankId] = useState(item?.bankId ? String(item.bankId) : '');
  const [monthlyAmount, setMonthlyAmount] = useState(
    item?.monthlyAmount ? formatNumberInput(item.monthlyAmount) : ''
  );
  const [startDate, setStartDate] = useState(item?.startDate ?? '');
  const [maturityDate, setMaturityDate] = useState(item?.maturityDate ?? '');
  const [interestRate, setInterestRate] = useState(
    item?.interestRate != null ? String(item.interestRate) : ''
  );
  const [expectedInterest, setExpectedInterest] = useState(
    item?.expectedInterest != null ? formatNumberInput(item.expectedInterest) : ''
  );
  const [actualInterest, setActualInterest] = useState(
    item?.actualInterest != null ? formatNumberInput(item.actualInterest) : ''
  );

  useEffect(() => {
    Promise.all([getMembers(), getBanks()])
      .then(([r1, r2]) => {
        setMembers(r1.data?.data ?? []);
        setBanks(r2.data?.data ?? []);
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    if (!selectedMemberId) return alert('멤버를 선택해주세요.');
    if (!name || !monthlyAmount) return alert('적금명과 월납입액을 입력해주세요.');
    const payload = {
      memberId: Number(selectedMemberId),
      name,
      bankId: bankId ? Number(bankId) : null,
      monthlyAmount: Number(parseNumberInput(monthlyAmount)),
      startDate: startDate || null,
      maturityDate: maturityDate || null,
      interestRate: interestRate !== '' ? Number(interestRate) : null,
      expectedInterest: expectedInterest !== '' ? Number(parseNumberInput(expectedInterest)) : null,
      actualInterest: actualInterest !== '' ? Number(parseNumberInput(actualInterest)) : null,
    };
    const request = isEdit
      ? updateSavingsMaster(item.id, payload)
      : createSavingsMaster(payload);
    request.then(() => onSaved()).catch(() => alert('저장에 실패했습니다.'));
  };

  const handleDelete = () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    deleteSavingsMaster(item.id)
      .then(() => onSaved())
      .catch(() => alert('삭제에 실패했습니다.'));
  };

  return (
    <Modal title={isEdit ? '적금 수정' : '적금 추가'} onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">멤버</label>
          <select
            className="form-select"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">멤버 선택</option>
            {members.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">적금명</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 청년 우대형 적금"
          />
        </div>
        <div className="form-group">
          <label className="form-label">은행</label>
          <select
            className="form-select"
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
          >
            <option value="">은행 선택</option>
            {banks.map((b) => (
              <option key={b.id} value={String(b.id)}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">월납입액 (원)</label>
          <input
            className="form-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(formatNumberInput(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">시작일자</label>
          <input
            className="form-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">만기일 (없으면 빈칸)</label>
          <input
            className="form-input"
            type="date"
            value={maturityDate}
            onChange={(e) => setMaturityDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">금리 (%)</label>
          <input
            className="form-input"
            type="text"
            inputMode="decimal"
            placeholder="예: 3.5"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value.replace(/[^0-9.]/g, ''))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">예상이자 (원)</label>
          <input
            className="form-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={expectedInterest}
            onChange={(e) => setExpectedInterest(formatNumberInput(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">실제이자 (원)</label>
          <input
            className="form-input"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={actualInterest}
            onChange={(e) => setActualInterest(formatNumberInput(e.target.value))}
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
