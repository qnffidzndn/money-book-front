import api from './index';

export const getSavings = (memberId) =>
  api.get(`/api/savings-accounts`, { params: { memberId } });

export const createSaving = (data) => api.post(`/api/savings-accounts`, data);

export const updateSaving = (id, data) => api.put(`/api/savings-accounts/${id}`, data);

export const deleteSaving = (id) => api.delete(`/api/savings-accounts/${id}`);
