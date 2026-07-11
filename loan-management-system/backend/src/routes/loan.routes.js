const express = require('express');
const loanController = require('../controllers/loan.controller');
const authenticate = require('../middleware/authenticate');
const { authorizeAdmin, authorizeCustomer } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  applyLoanRules,
  calculateEmiRules,
  loanIdParamRules,
  updateLoanStatusRules,
  listLoansQueryRules,
} = require('../validators/loan.validator');

const router = express.Router();

router.post(
  '/apply',
  authenticate,
  authorizeCustomer,
  validate(applyLoanRules),
  loanController.applyForLoan
);

router.post(
  '/calculate-emi',
  validate(calculateEmiRules),
  loanController.calculateEmi
);

router.get('/', authenticate, validate(listLoansQueryRules), loanController.getLoans);

router.get(
  '/:id',
  authenticate,
  validate(loanIdParamRules),
  loanController.getLoanById
);

router.put(
  '/:id/status',
  authenticate,
  authorizeAdmin,
  validate(updateLoanStatusRules),
  loanController.updateLoanStatus
);

module.exports = router;
