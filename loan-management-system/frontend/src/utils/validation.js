import { LOAN_LIMITS } from './format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (value) =>
  value === null || value === undefined || String(value).trim() === '';

export const visibleError = (errors, field, touched, submitted) =>
  touched[field] || submitted ? errors[field] : undefined;

export const mapApiFieldErrors = (apiErrors) => {
  if (!Array.isArray(apiErrors)) {
    return {};
  }

  return apiErrors.reduce((accumulator, { field, message }) => {
    if (field && message) {
      accumulator[field] = message;
    }
    return accumulator;
  }, {});
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  const trimmedEmail = email.trim();

  if (isBlank(trimmedEmail)) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Please provide a valid email';
  }

  if (isBlank(password)) {
    errors.password = 'Password is required';
  }

  return errors;
};

export const validateRegister = ({ name, email, password }) => {
  const errors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  if (isBlank(trimmedName)) {
    errors.name = 'Name is required';
  } else if (trimmedName.length > 100) {
    errors.name = 'Name cannot exceed 100 characters';
  }

  if (isBlank(trimmedEmail)) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Please provide a valid email';
  }

  if (isBlank(password)) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else if (password.length > 128) {
    errors.password = 'Password cannot exceed 128 characters';
  }

  return errors;
};

export const validateEmiInputs = (
  { loanAmount, interestRate, durationMonths },
  { minInterestRate = LOAN_LIMITS.minInterestRate } = {}
) => {
  const errors = {};
  const amount = Number(loanAmount);
  const rate = Number(interestRate);
  const tenure = Number(durationMonths);

  if (isBlank(loanAmount)) {
    errors.loanAmount = 'Loan amount is required';
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.loanAmount = 'Enter a positive amount';
  } else if (amount > LOAN_LIMITS.maxAmount) {
    errors.loanAmount = `Amount cannot exceed ${LOAN_LIMITS.maxAmount.toLocaleString('en-IN')}`;
  }

  if (isBlank(interestRate)) {
    errors.interestRate = 'Interest rate is required';
  } else if (!Number.isFinite(rate) || rate < minInterestRate || rate > LOAN_LIMITS.maxInterestRate) {
    errors.interestRate = `Rate must be between ${minInterestRate}% and ${LOAN_LIMITS.maxInterestRate}%`;
  }

  if (isBlank(durationMonths)) {
    errors.durationMonths = 'Duration is required';
  } else if (
    !Number.isInteger(tenure) ||
    tenure < LOAN_LIMITS.minDurationMonths ||
    tenure > LOAN_LIMITS.maxDurationMonths
  ) {
    errors.durationMonths = `Duration must be ${LOAN_LIMITS.minDurationMonths}–${LOAN_LIMITS.maxDurationMonths} months`;
  }

  return errors;
};

// Apply requires min 0.1% interest; EMI calculator allows 0% for zero-interest scenarios.
export const validateLoanApplication = (form) => {
  const errors = validateEmiInputs(form, { minInterestRate: LOAN_LIMITS.minApplyInterestRate });
  const purpose = form.purpose?.trim() ?? '';

  if (isBlank(purpose)) {
    errors.purpose = 'Loan purpose is required';
  } else if (purpose.length > 500) {
    errors.purpose = 'Purpose cannot exceed 500 characters';
  }

  return errors;
};

export const validatePaymentAmount = (amount, outstandingBalance) => {
  const errors = {};
  const value = Number(amount);

  if (isBlank(amount)) {
    errors.amount = 'Payment amount is required';
    return errors;
  }

  if (!Number.isFinite(value) || value <= 0) {
    errors.amount = 'Payment amount must be greater than 0';
    return errors;
  }

  if (outstandingBalance !== null && value > outstandingBalance) {
    errors.amount = 'Payment amount exceeds the outstanding balance';
  }

  return errors;
};

export const validateRemarks = (remarks, { required = false, max = 500 } = {}) => {
  const errors = {};
  const trimmed = remarks.trim();

  if (required && isBlank(trimmed)) {
    errors.remarks = 'Remarks are required when rejecting a loan';
  } else if (trimmed.length > max) {
    errors.remarks = `Remarks cannot exceed ${max} characters`;
  }

  return errors;
};
