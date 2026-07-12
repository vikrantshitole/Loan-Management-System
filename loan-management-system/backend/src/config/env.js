require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/loan_management',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  maxLoanAmount: Number(process.env.MAX_LOAN_AMOUNT) || 1000000,
  minLoanDurationMonths: Number(process.env.MIN_LOAN_DURATION_MONTHS) || 6,
  maxLoanDurationMonths: Number(process.env.MAX_LOAN_DURATION_MONTHS) || 360,
};

module.exports = env;
