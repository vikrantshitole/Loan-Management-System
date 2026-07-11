const express = require('express');
const { sendSuccess } = require('../utils/apiResponse');
const authRoutes = require('./auth.routes');
const loanRoutes = require('./loan.routes');
const paymentRoutes = require('./payment.routes');

const router = express.Router();

router.get('/health', (_req, res) => {
  sendSuccess(res, {
    message: 'Loan Management API is running',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use(authRoutes);
router.use('/loan', loanRoutes);
router.use('/payments', paymentRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;
