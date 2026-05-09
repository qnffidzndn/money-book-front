import api from './index';

export const getEmergencyFunds = () => api.get(`/api/emergency-fund-logs`);

export const createEmergencyFund = (data) => api.post(`/api/emergency-fund-logs`, data);

export const updateEmergencyFund = (id, data) =>
  api.put(`/api/emergency-fund-logs/${id}`, data);

export const deleteEmergencyFund = (id) => api.delete(`/api/emergency-fund-logs/${id}`);
