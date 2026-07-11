import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/login', credentials);
  return response.data.data;
};

export const register = async (payload) => {
  const response = await api.post('/register', payload);
  return response.data.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data.data.user;
};
