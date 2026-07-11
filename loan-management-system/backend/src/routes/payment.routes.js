const express = require('express');
const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { loanIdParamRules, createPaymentRules } = require('../validators/payment.validator');

const router = express.Router();

router.get(
  '/:loanId',
  authenticate,
  validate(loanIdParamRules),
  paymentController.getPaymentsByLoan
);

router.post('/', authenticate, validate(createPaymentRules), paymentController.createPayment);

module.exports = router;
