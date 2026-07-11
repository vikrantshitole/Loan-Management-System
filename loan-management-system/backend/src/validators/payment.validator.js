const { body, param } = require('express-validator');

const loanIdParamRules = [
  param('loanId').isInt({ min: 1 }).withMessage('Loan ID must be a positive integer'),
];

const createPaymentRules = [
  body('loanId')
    .notEmpty()
    .withMessage('Loan ID is required')
    .isInt({ min: 1 })
    .withMessage('Loan ID must be a positive integer'),
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 1 })
    .withMessage('Payment amount must be greater than 0'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid ISO 8601 date'),
];

module.exports = {
  loanIdParamRules,
  createPaymentRules,
};
