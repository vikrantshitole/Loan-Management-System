const { Op } = require('sequelize');
const { Payment } = require('../models');
const { LOAN_STATUS } = require('../utils/constants');
const emiService = require('./emi.service');

const roundCurrency = emiService.roundCurrency;

const buildEmiBreakdown = (loan) =>
  emiService.calculateEmiBreakdown({
    loanAmount: loan.loanAmount,
    interestRate: loan.interestRate,
    durationMonths: loan.durationMonths,
  });

const buildApprovedSummary = async (loan) => {
  const emiBreakdown = buildEmiBreakdown(loan);
  const loanAmount = Number(loan.loanAmount);

  const payments = await Payment.findAll({
    where: { loanId: loan.id },
    attributes: ['amount'],
  });

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const outstandingBalance = Math.max(loanAmount - totalPaid, 0);

  return {
    emi: emiBreakdown.emi,
    emiBreakdown,
    outstandingBalance: roundCurrency(outstandingBalance),
    totalPaid: roundCurrency(totalPaid),
  };
};

const buildPendingSummary = (loan) => {
  const emiBreakdown = buildEmiBreakdown(loan);

  return {
    emi: emiBreakdown.emi,
    emiBreakdown,
    outstandingBalance: null,
    totalPaid: 0,
  };
};

const getSummaryForLoan = async (loan) => {
  if (loan.status === LOAN_STATUS.APPROVED) {
    return buildApprovedSummary(loan);
  }

  if (loan.status === LOAN_STATUS.PENDING || loan.status === LOAN_STATUS.UNDER_REVIEW) {
    return buildPendingSummary(loan);
  }

  return {
    emi: null,
    emiBreakdown: null,
    outstandingBalance: null,
    totalPaid: 0,
  };
};

const getSummariesForLoans = async (loans) => {
  const approvedLoanIds = loans
    .filter((loan) => loan.status === LOAN_STATUS.APPROVED)
    .map((loan) => loan.id);

  const paymentTotals = approvedLoanIds.length
    ? await Payment.findAll({
        where: { loanId: { [Op.in]: approvedLoanIds } },
        attributes: ['loanId', 'amount'],
      })
    : [];

  const totalsByLoanId = paymentTotals.reduce((accumulator, payment) => {
    const loanId = payment.loanId;
    accumulator[loanId] = (accumulator[loanId] || 0) + Number(payment.amount);
    return accumulator;
  }, {});

  const summaries = {};

  for (const loan of loans) {
    if (loan.status === LOAN_STATUS.APPROVED) {
      const emiBreakdown = buildEmiBreakdown(loan);
      const totalPaid = totalsByLoanId[loan.id] || 0;
      const outstandingBalance = Math.max(Number(loan.loanAmount) - totalPaid, 0);

      summaries[loan.id] = {
        emi: emiBreakdown.emi,
        emiBreakdown,
        outstandingBalance: roundCurrency(outstandingBalance),
        totalPaid: roundCurrency(totalPaid),
      };
      continue;
    }

    if (loan.status === LOAN_STATUS.PENDING || loan.status === LOAN_STATUS.UNDER_REVIEW) {
      summaries[loan.id] = buildPendingSummary(loan);
      continue;
    }

    summaries[loan.id] = {
      emi: null,
      emiBreakdown: null,
      outstandingBalance: null,
      totalPaid: 0,
    };
  }

  return summaries;
};

module.exports = {
  getSummaryForLoan,
  getSummariesForLoans,
};
