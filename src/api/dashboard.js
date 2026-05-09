import api from './index';

export const getSummary = (year, month) =>
  api.get(`/api/dashboard/summary`, { params: { year, month } });
