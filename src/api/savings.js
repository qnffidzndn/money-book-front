import api from './index';

export const getSavings = (memberId, ym) =>
  api.get(`/api/savings-accounts`, { params: { memberId, ym } });

export const getSavingsByMasterId = (savingsMasterId) =>
  api.get(`/api/savings-accounts`, { params: { savingsMasterId } });

export const getSavingsMaster = (memberId) =>
  api.get(`/api/savings-master`, { params: { memberId } });

export const createSavingsMaster = (data) => api.post(`/api/savings-master`, data);

export const updateSavingsMaster = (id, data) => api.put(`/api/savings-master/${id}`, data);

export const deleteSavingsMaster = (id) => api.delete(`/api/savings-master/${id}`);

export const createSaving = (data) => api.post(`/api/savings-accounts`, data);

export const updateSaving = (id, data) => api.put(`/api/savings-accounts/${id}`, data);

export const deleteSaving = (id) => api.delete(`/api/savings-accounts/${id}`);
