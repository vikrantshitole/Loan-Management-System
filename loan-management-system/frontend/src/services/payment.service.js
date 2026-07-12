import api from './api';

export const getPaymentHistory = async (loanId) => {
  const response = await api.get(`/payments/${loanId}`);
  return response.data.data;
};

export const recordPayment = async (payload) => {
  const response = await api.post('/payments', payload);
  return response.data.data;
};
