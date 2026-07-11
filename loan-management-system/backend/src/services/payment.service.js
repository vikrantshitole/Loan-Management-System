const AppError = require('../utils/AppError');

const recordPayment = async (_user, _payload) => {
  throw AppError.notImplemented('Payment recording will be implemented in Stage 10');
};

const getPaymentsByLoan = async (_user, _loanId) => {
  throw AppError.notImplemented('Payment history will be implemented in Stage 10');
};

module.exports = {
  recordPayment,
  getPaymentsByLoan,
};
