import { useState } from 'react';
import Modal from './Modal';
import { createAssetType, updateAssetType, deleteAssetType } from '../api/asset';

export default function AssetTypeModal({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [name, setName] = useState(item?.name ?? '');

  const handleSave = () => {
    if (!name.trim()) return alert('자산유형명을 입력해주세요.');
    const payload = { name: name.trim() };
    const request = isEdit ? updateAssetType(item.id, payload) : createAssetType(payload);
    request.then(() => onSaved()).catch(() => alert('저장에 실패했습니다.'));
  };

  const handleDelete = () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    deleteAssetType(item.id)
      .then(() => onSaved())
      .catch(() => alert('삭제에 실패했습니다.'));
  };

  return (
    <Modal title={isEdit ? '자산유형 수정' : '자산유형 추가'} onClose={onClose}>
      <div className="modal-form">
        <div className="form-group">
          <label className="form-label">자산유형명</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 비트코인"
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
