import api from './index';

export const getBanks = () => api.get('/api/banks');
export const createBank = (data) => api.post('/api/banks', data);
export const updateBank = (id, data) => api.put(`/api/banks/${id}`, data);
export const deleteBank = (id) => api.delete(`/api/banks/${id}`);
