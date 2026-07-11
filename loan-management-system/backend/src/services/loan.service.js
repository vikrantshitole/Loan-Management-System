const { Op } = require('sequelize');
const { Loan } = require('../models');
const AppError = require('../utils/AppError');
const { LOAN_STATUS, USER_ROLES } = require('../utils/constants');
const { getAdminLoanIncludes, getCustomerLoanIncludes } = require('../utils/loanIncludes');
const { toPublicLoan, toPublicLoanList, toLoanStatusDetail } = require('../utils/loan.mapper');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { validateStatusTransition, requiresRemarks } = require('../utils/loanStatus');
const emiService = require('./emi.service');
const loanSummaryService = require('./loanSummary.service');

const ACTIVE_APPLICATION_STATUSES = [LOAN_STATUS.PENDING, LOAN_STATUS.UNDER_REVIEW];

const applyForLoan = async (user, payload) => {
  const existingApplication = await Loan.findOne({
    where: {
      userId: user.id,
      status: { [Op.in]: ACTIVE_APPLICATION_STATUSES },
    },
  });

  if (existingApplication) {
    throw AppError.conflict('You already have an active loan application under review');
  }

  const loan = await Loan.create({
    userId: user.id,
    loanAmount: payload.loanAmount,
    interestRate: payload.interestRate,
    durationMonths: payload.durationMonths,
    purpose: payload.purpose.trim(),
    status: LOAN_STATUS.PENDING,
  });

  const summary = await loanSummaryService.getSummaryForLoan(loan);

  return toPublicLoan(loan, summary);
};

const buildLoanQuery = (user, query) => {
  const where = {};

  if (user.role === USER_ROLES.CUSTOMER) {
    where.userId = user.id;
  }

  if (query.status) {
    where.status = query.status;
  }

  return where;
};

const getLoanIncludes = (user) =>
  user.role === USER_ROLES.ADMIN ? getAdminLoanIncludes() : getCustomerLoanIncludes();

const getLoans = async (user, query = {}) => {
  const { page, limit, offset } = parsePagination(query);
  const where = buildLoanQuery(user, query);

  const { rows, count } = await Loan.findAndCountAll({
    where,
    include: getLoanIncludes(user),
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  const summaries = await loanSummaryService.getSummariesForLoans(rows);

  return {
    loans: toPublicLoanList(rows, summaries),
    meta: buildPaginationMeta({ page, limit, total: count }),
  };
};

const getLoanById = async (user, loanId) => {
  const loan = await Loan.findByPk(loanId, {
    include: getLoanIncludes(user),
  });

  if (!loan) {
    throw AppError.notFound('Loan not found');
  }

  if (user.role === USER_ROLES.CUSTOMER && loan.userId !== user.id) {
    throw AppError.forbidden('You can only view your own loan applications');
  }

  const summary = await loanSummaryService.getSummaryForLoan(loan);

  return toLoanStatusDetail(loan, summary);
};

const updateLoanStatus = async (admin, loanId, { status, remarks }) => {
  const loan = await Loan.findByPk(loanId, {
    include: getAdminLoanIncludes(),
  });

  if (!loan) {
    throw AppError.notFound('Loan not found');
  }

  validateStatusTransition(loan.status, status);

  const normalizedRemarks = remarks?.trim() || null;

  if (requiresRemarks(status) && !normalizedRemarks) {
    throw AppError.badRequest('Remarks are required when rejecting a loan');
  }

  await loan.update({
    status,
    remarks: normalizedRemarks,
    approvedBy: admin.id,
  });

  await loan.reload({ include: getAdminLoanIncludes() });

  const summary = await loanSummaryService.getSummaryForLoan(loan);

  return toLoanStatusDetail(loan, summary);
};

const calculateEmi = async (payload) => emiService.calculateEmiBreakdown(payload);

module.exports = {
  applyForLoan,
  getLoans,
  getLoanById,
  updateLoanStatus,
  calculateEmi,
};
