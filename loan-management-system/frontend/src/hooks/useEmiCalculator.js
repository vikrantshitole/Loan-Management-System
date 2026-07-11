import { useEffect, useMemo, useState } from 'react';
import { calculateEmi } from '../services/loan.service';
import { calculateEmiBreakdown, isEmiInputComplete } from '../utils/emi';
import { LOAN_LIMITS } from '../utils/format';

const VERIFY_DEBOUNCE_MS = 400;

const createInitialValues = () => ({
  loanAmount: '',
  interestRate: String(LOAN_LIMITS.defaultInterestRate),
  durationMonths: '',
});

const validateInputs = ({ loanAmount, interestRate, durationMonths }) => {
  const errors = {};

  const amount = Number(loanAmount);
  const rate = Number(interestRate);
  const tenure = Number(durationMonths);

  if (loanAmount === '') {
    errors.loanAmount = 'Loan amount is required';
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.loanAmount = 'Enter a positive amount';
  } else if (amount > LOAN_LIMITS.maxAmount) {
    errors.loanAmount = `Amount cannot exceed ${LOAN_LIMITS.maxAmount.toLocaleString('en-IN')}`;
  }

  if (interestRate === '') {
    errors.interestRate = 'Interest rate is required';
  } else if (
    !Number.isFinite(rate) ||
    rate < LOAN_LIMITS.minInterestRate ||
    rate > LOAN_LIMITS.maxInterestRate
  ) {
    errors.interestRate = `Rate must be between ${LOAN_LIMITS.minInterestRate}% and ${LOAN_LIMITS.maxInterestRate}%`;
  }

  if (durationMonths === '') {
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

const useEmiCalculator = () => {
  const [values, setValues] = useState(createInitialValues);
  const [touched, setTouched] = useState({});
  const [serverResult, setServerResult] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('idle');
  const [verifyError, setVerifyError] = useState(null);

  const errors = useMemo(() => validateInputs(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const liveResult = useMemo(() => {
    if (!isEmiInputComplete(values) || !isValid) {
      return null;
    }

    return calculateEmiBreakdown({
      loanAmount: Number(values.loanAmount),
      interestRate: Number(values.interestRate),
      durationMonths: Number(values.durationMonths),
    });
  }, [values, isValid]);

  useEffect(() => {
    if (!liveResult) {
      setServerResult(null);
      setVerifyStatus('idle');
      setVerifyError(null);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      setVerifyStatus('verifying');
      setVerifyError(null);

      try {
        const verified = await calculateEmi({
          loanAmount: Number(values.loanAmount),
          interestRate: Number(values.interestRate),
          durationMonths: Number(values.durationMonths),
        });

        setServerResult(verified);
        setVerifyStatus('verified');
      } catch (error) {
        setServerResult(null);
        setVerifyStatus('error');
        setVerifyError(
          error.response?.data?.message || 'Unable to verify EMI with the server'
        );
      }
    }, VERIFY_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [liveResult, values.loanAmount, values.interestRate, values.durationMonths]);

  const matchesServer =
    liveResult &&
    serverResult &&
    liveResult.emi === serverResult.emi &&
    liveResult.totalPayment === serverResult.totalPayment;

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const touchField = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const reset = () => {
    setValues(createInitialValues());
    setTouched({});
    setServerResult(null);
    setVerifyStatus('idle');
    setVerifyError(null);
  };

  return {
    values,
    errors,
    touched,
    isValid,
    liveResult,
    serverResult,
    verifyStatus,
    verifyError,
    matchesServer,
    updateField,
    touchField,
    reset,
  };
};

export default useEmiCalculator;
