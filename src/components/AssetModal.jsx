import { useEffect, useState } from 'react';
import Modal from './Modal';
import { createAsset, updateAsset, deleteAsset, getAssetTypes } from '../api/asset';
import { formatNumberInput, parseNumberInput } from '../utils/format';

export default function AssetModal({ item, members, onClose, onSaved }) {
  const isEdit = !!item;
  const today = new Date().toISOString().slice(0, 10);

  const [assetTypes, setAssetTypes] = useState([]);
  const [memberId, setMemberId] = useState(item?.memberId ? String(item.memberId) : '');
  const [assetTypeId, setAssetTypeId] = useState(item?.assetTypeId ? String(item.assetTypeId) : '');
  const [amount, setAmount] = useState(item?.amount != null ? formatNumberInput(item.amount) : '');
  const [assetDate, setAssetDate] = useState(item?.assetDate ?? today);
  const [description, setDescription] = useState(item?.description ?? '');

  useEffect(() => {
    getAssetTypes()
      .then((r) => {
        const types = r.data?.data ?? [];
setAssetTypes(types);
        if (item?.assetTypeId) {
          setAssetTypeId(String(item.assetTypeId));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    if (!memberId || !assetTypeId || !amount || !assetDate)
      return alert('멤버, 자산 유형, 금액, 기준일자를 입력해주세요.');
    const payload = {
      memberId: Number(memberId),
      assetTypeId: Number(assetTypeId),
      amount: Number(parseNumberInput(amount)),
      assetDate,
      description: description || null,
    };
    const request = isEdit ? updateAsset(item.id, payload) : createAsset(payload);
    request.then(() => onSaved()).catch(() => alert('저장에 실패했습니다.'));
  };

  const handleDelete = () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    deleteAsset(item.id)
      .then(() => onSaved())
      .catch(() => alert('삭제에 실패했습니다.'));
  };

  return (
    <Modal title={isEdit ? '자산 수정' : '자산 추가'} onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">멤버</label>
          <select className="form-select" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="">멤버 선택</option>
            {members.map((m) => (
              <option key={m.id} value={String(m.id)}>{m.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">자산 유형</label>
          <select className="form-select" value={assetTypeId} onChange={(e) => setAssetTypeId(e.target.value)}>
            <option value="">유형 선택</option>
            {assetTypes.map((t) => (
              <option key={t.id} value={String(t.id)}>{t.name}</option>
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
        <div className="form-group">
          <label className="form-label">기준일자</label>
          <input
            className="form-input"
            type="date"
            value={assetDate}
            onChange={(e) => setAssetDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">설명 (선택)</label>
          <input
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
