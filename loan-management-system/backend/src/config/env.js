require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/loan-management',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  maxLoanAmount: Number(process.env.MAX_LOAN_AMOUNT) || 1000000,
  minLoanDurationMonths: Number(process.env.MIN_LOAN_DURATION_MONTHS) || 6,
  maxLoanDurationMonths: Number(process.env.MAX_LOAN_DURATION_MONTHS) || 360,
  defaultInterestRate: Number(process.env.DEFAULT_INTEREST_RATE) || 10,
};

module.exports = env;
