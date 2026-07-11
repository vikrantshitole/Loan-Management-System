const express = require('express');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Loan Management API is running',
  });
});

module.exports = router;
