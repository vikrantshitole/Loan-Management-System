/**
 * Standard reducing-balance EMI formula:
 *
 *   EMI = P × R × (1+R)^N / ((1+R)^N − 1)
 *
 * P = principal, R = monthly rate (annual% / 12 / 100), N = tenure in months
 */

const CURRENCY_PRECISION = 2;
const RATE_PRECISION = 4;

const round = (value, precision) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const roundCurrency = (value) => round(value, CURRENCY_PRECISION);
const roundRate = (value) => round(value, RATE_PRECISION);

const toMonthlyRate = (annualInterestRate) => Number(annualInterestRate) / 12 / 100;

const calculateEmiBreakdown = ({ loanAmount, interestRate, durationMonths }) => {
  const principal = Number(loanAmount);
  const annualRate = Number(interestRate);
  const tenure = Number(durationMonths);

  if (!Number.isFinite(principal) || principal <= 0) {
    throw new Error('Loan amount must be a positive number');
  }

  if (!Number.isFinite(annualRate) || annualRate < 0) {
    throw new Error('Interest rate must be a non-negative number');
  }

  if (!Number.isInteger(tenure) || tenure <= 0) {
    throw new Error('Duration must be a positive integer');
  }

  const monthlyRate = toMonthlyRate(annualRate);

  let emi;
  let totalPayment;
  let totalInterest;

  if (monthlyRate === 0) {
    emi = principal / tenure;
    totalPayment = principal;
    totalInterest = 0;
  } else {
    const compoundFactor = (1 + monthlyRate) ** tenure;
    emi = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
    totalPayment = emi * tenure;
    totalInterest = totalPayment - principal;
  }

  return {
    loanAmount: roundCurrency(principal),
    interestRate: annualRate,
    durationMonths: tenure,
    monthlyInterestRate: roundRate(monthlyRate * 100),
    emi: roundCurrency(emi),
    totalPayment: roundCurrency(totalPayment),
    totalInterest: roundCurrency(totalInterest),
    breakdown: {
      principal: roundCurrency(principal),
      interest: roundCurrency(totalInterest),
      tenureMonths: tenure,
    },
  };
};

module.exports = {
  calculateEmiBreakdown,
  toMonthlyRate,
  roundCurrency,
};
