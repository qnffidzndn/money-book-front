import api from './index';

export const login = (username, password) =>
  api.post('/api/auth/login', { username, password });
