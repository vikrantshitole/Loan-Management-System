import api from './api';

export const calculateEmi = async (payload) => {
  const response = await api.post('/loan/calculate-emi', payload);
  return response.data.data;
};

export const getLoans = async (params = {}) => {
  const response = await api.get('/loan', { params });
  return response.data.data;
};

export const getLoanById = async (loanId) => {
  const response = await api.get(`/loan/${loanId}`);
  return response.data.data;
};

export const applyForLoan = async (payload) => {
  const response = await api.post('/loan/apply', payload);
  return response.data.data;
};

export const updateLoanStatus = async (loanId, payload) => {
  const response = await api.put(`/loan/${loanId}/status`, payload);
  return response.data.data;
};
