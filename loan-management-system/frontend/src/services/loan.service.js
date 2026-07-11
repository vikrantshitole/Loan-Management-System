import api from './api';

export const calculateEmi = async (payload) => {
  const response = await api.post('/loan/calculate-emi', payload);
  return response.data.data;
};
