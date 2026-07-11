const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const loanService = require('../services/loan.service');

const applyForLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.applyForLoan(req.user, req.body);

  return sendSuccess(res, {
    data: loan,
    message: 'Loan application submitted successfully',
    statusCode: 201,
  });
});

const getLoans = asyncHandler(async (req, res) => {
  const { loans, meta } = await loanService.getLoans(req.user, req.query);

  return sendSuccess(res, {
    data: loans,
    message: 'Loans retrieved successfully',
    meta,
  });
});

const getLoanById = asyncHandler(async (req, res) => {
  const loan = await loanService.getLoanById(req.user, req.params.id);

  return sendSuccess(res, {
    data: loan,
    message: 'Loan retrieved successfully',
  });
});

const updateLoanStatus = asyncHandler(async (req, res) => {
  const loan = await loanService.updateLoanStatus(req.user, req.params.id, req.body);

  return sendSuccess(res, {
    data: loan,
    message: 'Loan status updated successfully',
  });
});

const calculateEmi = asyncHandler(async (req, res) => {
  const breakdown = await loanService.calculateEmi(req.body);

  return sendSuccess(res, {
    data: breakdown,
    message: 'EMI calculated successfully',
  });
});

module.exports = {
  applyForLoan,
  getLoans,
  getLoanById,
  updateLoanStatus,
  calculateEmi,
};
