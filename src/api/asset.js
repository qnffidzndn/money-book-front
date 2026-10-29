import api from './index';

export const getAssets = (memberId) =>
  api.get(`/api/asset-allocations`, { params: { memberId } });

export const createAsset = (data) => api.post(`/api/asset-allocations`, data);

export const updateAsset = (id, data) => api.put(`/api/asset-allocations/${id}`, data);

export const deleteAsset = (id) => api.delete(`/api/asset-allocations/${id}`);

export const getAssetTypes = () => api.get('/api/asset-types');
export const createAssetType = (data) => api.post('/api/asset-types', data);
export const updateAssetType = (id, data) => api.put(`/api/asset-types/${id}`, data);
export const deleteAssetType = (id) => api.delete(`/api/asset-types/${id}`);
