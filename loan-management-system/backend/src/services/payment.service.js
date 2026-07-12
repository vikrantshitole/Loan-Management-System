const { Loan, Payment } = require('../models');
const AppError = require('../utils/AppError');
const { LOAN_STATUS, USER_ROLES } = require('../utils/constants');
const { toPublicPayment, toPublicPaymentList } = require('../utils/payment.mapper');
const emiService = require('./emi.service');

const roundCurrency = emiService.roundCurrency;

const assertLoanAccess = (user, loan) => {
  if (!loan) {
    throw AppError.notFound('Loan not found');
  }

  if (user.role === USER_ROLES.CUSTOMER && loan.userId !== user.id) {
    throw AppError.forbidden('You can only access payments for your own loans');
  }
};

const calculatePaymentTotals = (loanAmount, payments) => {
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remainingBalance = Math.max(Number(loanAmount) - totalPaid, 0);

  return {
    totalPaid: roundCurrency(totalPaid),
    remainingBalance: roundCurrency(remainingBalance),
  };
};

const getPaymentHistory = async (user, loanId) => {
  const loan = await Loan.findByPk(loanId);

  assertLoanAccess(user, loan);

  const payments = await Payment.findAll({
    where: { loanId },
    order: [['paymentDate', 'DESC'], ['id', 'DESC']],
  });

  const totals = calculatePaymentTotals(loan.loanAmount, payments);

  return {
    loanId: loan.id,
    loanAmount: roundCurrency(Number(loan.loanAmount)),
    status: loan.status,
    totalPaid: totals.totalPaid,
    remainingBalance: loan.status === LOAN_STATUS.APPROVED ? totals.remainingBalance : null,
    payments: toPublicPaymentList(payments),
  };
};

const recordPayment = async (user, { loanId, amount, paymentDate }) => {
  const loan = await Loan.findByPk(loanId);

  assertLoanAccess(user, loan);

  if (loan.status !== LOAN_STATUS.APPROVED) {
    throw AppError.badRequest('Payments can only be recorded against approved loans');
  }

  const existingPayments = await Payment.findAll({
    where: { loanId },
    attributes: ['amount'],
  });

  const totals = calculatePaymentTotals(loan.loanAmount, existingPayments);
  const paymentAmount = roundCurrency(Number(amount));

  if (paymentAmount > totals.remainingBalance) {
    throw AppError.badRequest('Payment amount exceeds the outstanding balance');
  }

  const remainingBalance = roundCurrency(totals.remainingBalance - paymentAmount);

  // Snapshot the balance after this payment for historical reporting.
  const payment = await Payment.create({
    loanId,
    amount: paymentAmount,
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    remainingBalance,
  });

  return {
    payment: toPublicPayment(payment),
    summary: {
      totalPaid: roundCurrency(totals.totalPaid + paymentAmount),
      remainingBalance,
    },
  };
};

module.exports = {
  getPaymentHistory,
  recordPayment,
};
