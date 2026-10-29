import api from './index';

export const getMembers = () => api.get(`/api/members`);
