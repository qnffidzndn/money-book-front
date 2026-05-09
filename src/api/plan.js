import api from './index';

export const getPlans = (memberId, ym) =>
  api.get(`/api/plans`, { params: { memberId, ym } });

export const createPlan = (data) => api.post(`/api/plans`, data);

export const updatePlan = (id, data) => api.put(`/api/plans/${id}`, data);

export const deletePlan = (id) => api.delete(`/api/plans/${id}`);
