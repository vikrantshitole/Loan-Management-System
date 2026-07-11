/**
 * Calculates EMI using the standard reducing-balance formula.
 *
 * EMI = P × R × (1+R)^N / ((1+R)^N - 1)
 *
 * Where:
 * - P = principal (loan amount)
 * - R = monthly interest rate (annual rate / 12 / 100)
 * - N = tenure in months
 */
const calculateEmiBreakdown = ({ loanAmount, interestRate, durationMonths }) => {
  const principal = Number(loanAmount);
  const annualRate = Number(interestRate);
  const tenure = Number(durationMonths);
  const monthlyRate = annualRate / 12 / 100;

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
    emi: roundCurrency(emi),
    totalPayment: roundCurrency(totalPayment),
    totalInterest: roundCurrency(totalInterest),
    monthlyRate: roundRate(monthlyRate * 100),
  };
};

const roundCurrency = (value) => Math.round(value * 100) / 100;
const roundRate = (value) => Math.round(value * 10000) / 10000;

module.exports = {
  calculateEmiBreakdown,
};
