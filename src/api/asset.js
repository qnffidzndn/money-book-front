import api from './index';

export const getAssets = () => api.get(`/api/asset-snapshots`);

export const createAsset = (data) => api.post(`/api/asset-snapshots`, data);

export const updateAsset = (id, data) => api.put(`/api/asset-snapshots/${id}`, data);

export const deleteAsset = (id) => api.delete(`/api/asset-snapshots/${id}`);
