export const LOAN_LIMITS = {
  maxAmount: 1_000_000,
  minDurationMonths: 6,
  maxDurationMonths: 360,
  minInterestRate: 0,
  maxInterestRate: 30,
  defaultInterestRate: 10,
};

export const formatCurrency = (value, currency = 'INR') => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
};
