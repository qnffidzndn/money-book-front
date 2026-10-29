import api from './index';

export const getIncome = (memberId, ym) =>
  api.get(`/api/incomes`, { params: { memberId, ym } });

export const createIncome = (data) => api.post(`/api/incomes`, data);

export const updateIncome = (id, data) => api.put(`/api/incomes/${id}`, data);
