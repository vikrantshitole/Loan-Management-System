import { useEffect, useMemo, useState } from 'react';
import { calculateEmi } from '../services/loan.service';
import { calculateEmiBreakdown, isEmiInputComplete } from '../utils/emi';
import { LOAN_LIMITS } from '../utils/format';
import { validateEmiInputs } from '../utils/validation';

const VERIFY_DEBOUNCE_MS = 400;

// Debounced server verification keeps the live preview aligned with the API.
const createInitialValues = () => ({
  loanAmount: '',
  interestRate: String(LOAN_LIMITS.defaultInterestRate),
  durationMonths: '',
});

const useEmiCalculator = () => {
  const [values, setValues] = useState(createInitialValues);
  const [touched, setTouched] = useState({});
  const [serverResult, setServerResult] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState('idle');
  const [verifyError, setVerifyError] = useState(null);

  const errors = useMemo(() => validateEmiInputs(values), [values]);
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
