const { Op } = require('sequelize');
const { Loan, User } = require('../models');
const AppError = require('../utils/AppError');
const { LOAN_STATUS, USER_ROLES } = require('../utils/constants');
const { toPublicLoan, toPublicLoanList } = require('../utils/loan.mapper');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const emiService = require('./emi.service');

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

  return toPublicLoan(loan);
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

const getLoans = async (user, query = {}) => {
  const { page, limit, offset } = parsePagination(query);
  const where = buildLoanQuery(user, query);

  const include =
    user.role === USER_ROLES.ADMIN
      ? [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }]
      : [];

  const { rows, count } = await Loan.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    loans: toPublicLoanList(rows),
    meta: buildPaginationMeta({ page, limit, total: count }),
  };
};

const getLoanById = async (user, loanId) => {
  const include =
    user.role === USER_ROLES.ADMIN
      ? [{ model: User, as: 'customer', attributes: ['id', 'name', 'email'] }]
      : [];

  const loan = await Loan.findByPk(loanId, { include });

  if (!loan) {
    throw AppError.notFound('Loan not found');
  }

  if (user.role === USER_ROLES.CUSTOMER && loan.userId !== user.id) {
    throw AppError.forbidden('You can only view your own loan applications');
  }

  return toPublicLoan(loan);
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
