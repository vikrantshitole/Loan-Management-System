const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const paymentService = require('../services/payment.service');

const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.recordPayment(req.user, req.body);

  return sendSuccess(res, {
    data: payment,
    message: 'Payment recorded successfully',
    statusCode: 201,
  });
});

const getPaymentsByLoan = asyncHandler(async (req, res) => {
  const history = await paymentService.getPaymentHistory(req.user, req.params.loanId);

  return sendSuccess(res, {
    data: history,
    message: 'Payment history retrieved successfully',
  });
});

module.exports = {
  createPayment,
  getPaymentsByLoan,
};
