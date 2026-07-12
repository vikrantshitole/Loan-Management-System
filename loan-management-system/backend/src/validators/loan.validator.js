const { body, param, query } = require('express-validator');
const env = require('../config/env');
const { LOAN_STATUS_VALUES } = require('../utils/constants');

const applyLoanRules = [
  body('loanAmount')
    .notEmpty()
    .withMessage('Loan amount is required')
    .isFloat({ min: 1, max: env.maxLoanAmount })
    .withMessage(`Loan amount must be between 1 and ${env.maxLoanAmount}`),
  body('interestRate')
    .notEmpty()
    .withMessage('Interest rate is required')
    .isFloat({ min: 0.1, max: 30 })
    .withMessage('Interest rate must be between 0.1 and 30'),
  body('durationMonths')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({
      min: env.minLoanDurationMonths,
      max: env.maxLoanDurationMonths,
    })
    .withMessage(
      `Duration must be between ${env.minLoanDurationMonths} and ${env.maxLoanDurationMonths} months`
    ),
  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Loan purpose is required')
    .isLength({ max: 500 })
    .withMessage('Purpose cannot exceed 500 characters'),
];

const calculateEmiRules = [
  body('loanAmount')
    .notEmpty()
    .withMessage('Loan amount is required')
    .isFloat({ min: 1, max: env.maxLoanAmount })
    .withMessage(`Loan amount must be between 1 and ${env.maxLoanAmount}`),
  body('interestRate')
    .notEmpty()
    .withMessage('Interest rate is required')
    .isFloat({ min: 0, max: 30 })
    .withMessage('Interest rate must be between 0 and 30'),
  body('durationMonths')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({
      min: env.minLoanDurationMonths,
      max: env.maxLoanDurationMonths,
    })
    .withMessage(
      `Duration must be between ${env.minLoanDurationMonths} and ${env.maxLoanDurationMonths} months`
    ),
];

const loanIdParamRules = [
  param('id').isInt({ min: 1 }).withMessage('Loan ID must be a positive integer'),
];

const updateLoanStatusRules = [
  ...loanIdParamRules,
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(LOAN_STATUS_VALUES)
    .withMessage(`Status must be one of: ${LOAN_STATUS_VALUES.join(', ')}`),
  body('remarks')
    .if((_, { req }) => req.body.status === 'Rejected')
    .trim()
    .notEmpty()
    .withMessage('Remarks are required when rejecting a loan')
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters'),
  body('remarks')
    .if((_, { req }) => req.body.status !== 'Rejected')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks cannot exceed 500 characters'),
];

const listLoansQueryRules = [
  query('status')
    .optional()
    .isIn(LOAN_STATUS_VALUES)
    .withMessage(`Status must be one of: ${LOAN_STATUS_VALUES.join(', ')}`),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

module.exports = {
  applyLoanRules,
  calculateEmiRules,
  loanIdParamRules,
  updateLoanStatusRules,
  listLoansQueryRules,
};
