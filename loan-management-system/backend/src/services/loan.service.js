const AppError = require('../utils/AppError');
const emiService = require('./emi.service');

const applyForLoan = async (_user, _payload) => {
  throw AppError.notImplemented('Loan application will be implemented in Stage 6');
};

const getLoans = async (_user, _query) => {
  throw AppError.notImplemented('Loan listing will be implemented in Stage 6');
};

const getLoanById = async (_user, _loanId) => {
  throw AppError.notImplemented('Loan details will be implemented in Stage 9');
};

const updateLoanStatus = async (_admin, _loanId, _payload) => {
  throw AppError.notImplemented('Loan approval workflow will be implemented in Stage 8');
};

const calculateEmi = async (payload) => emiService.calculateEmiBreakdown(payload);

module.exports = {
  applyForLoan,
  getLoans,
  getLoanById,
  updateLoanStatus,
  calculateEmi,
};
