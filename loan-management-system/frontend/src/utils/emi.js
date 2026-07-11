/**
 * Standard reducing-balance EMI:
 * EMI = P × R × (1+R)^N / ((1+R)^N − 1)
 */

const round = (value, precision) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

export const roundCurrency = (value) => round(value, 2);

export const calculateEmiBreakdown = ({ loanAmount, interestRate, durationMonths }) => {
  const principal = Number(loanAmount);
  const annualRate = Number(interestRate);
  const tenure = Number(durationMonths);

  if (!Number.isFinite(principal) || principal <= 0) {
    return null;
  }

  if (!Number.isFinite(annualRate) || annualRate < 0) {
    return null;
  }

  if (!Number.isInteger(tenure) || tenure <= 0) {
    return null;
  }

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
    monthlyInterestRate: round(monthlyRate * 100, 4),
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

export const isEmiInputComplete = ({ loanAmount, interestRate, durationMonths }) => {
  return (
    loanAmount !== '' &&
    interestRate !== '' &&
    durationMonths !== '' &&
    Number.isFinite(Number(loanAmount)) &&
    Number.isFinite(Number(interestRate)) &&
    Number.isFinite(Number(durationMonths))
  );
};
