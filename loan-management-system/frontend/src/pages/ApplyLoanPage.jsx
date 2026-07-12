import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';
import useFormTouched from '../hooks/useFormTouched';
import { applyForLoan } from '../services/loan.service';
import { createEmptyLoanForm, LOAN_LIMITS } from '../utils/format';
import { mapApiFieldErrors, validateLoanApplication, visibleError } from '../utils/validation';

const ApplyLoanPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(createEmptyLoanForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const { touched, submitted, touch, markSubmitted } = useFormTouched();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    markSubmitted();

    const validationErrors = validateLoanApplication(form);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      loanAmount: Number(form.loanAmount),
      interestRate: Number(form.interestRate),
      durationMonths: Number(form.durationMonths),
      purpose: form.purpose.trim(),
    };

    try {
      const loan = await applyForLoan(payload);
      navigate(`/loans/${loan.id}`);
    } catch (submitError) {
      const apiErrors = mapApiFieldErrors(submitError.response?.data?.errors);
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
      }
      setError(submitError.response?.data?.message || 'Unable to submit loan application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Apply for a loan"
        description="Submit your application. It will be reviewed by an admin with Pending status."
      />

      <Card>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid-2">
            <FormField
              label="Loan amount"
              error={visibleError(fieldErrors, 'loanAmount', touched, submitted)}
            >
              <input
                type="number"
                min="1"
                max={LOAN_LIMITS.maxAmount}
                value={form.loanAmount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, loanAmount: event.target.value }))
                }
                onBlur={() => touch('loanAmount')}
              />
            </FormField>

            <FormField
              label="Annual interest rate (%)"
              error={visibleError(fieldErrors, 'interestRate', touched, submitted)}
            >
              <input
                type="number"
                min={LOAN_LIMITS.minApplyInterestRate}
                max={LOAN_LIMITS.maxInterestRate}
                step="0.1"
                value={form.interestRate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, interestRate: event.target.value }))
                }
                onBlur={() => touch('interestRate')}
              />
            </FormField>

            <FormField
              label="Duration (months)"
              error={visibleError(fieldErrors, 'durationMonths', touched, submitted)}
            >
              <input
                type="number"
                min={LOAN_LIMITS.minDurationMonths}
                max={LOAN_LIMITS.maxDurationMonths}
                value={form.durationMonths}
                onChange={(event) =>
                  setForm((current) => ({ ...current, durationMonths: event.target.value }))
                }
                onBlur={() => touch('durationMonths')}
              />
            </FormField>
          </div>

          <FormField
            label="Purpose"
            error={visibleError(fieldErrors, 'purpose', touched, submitted)}
          >
            <textarea
              rows="4"
              value={form.purpose}
              onChange={(event) =>
                setForm((current) => ({ ...current, purpose: event.target.value }))
              }
              onBlur={() => touch('purpose')}
              placeholder="Describe why you need this loan"
            />
          </FormField>

          {error ? <p className="form-error">{error}</p> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit application'}
          </Button>
        </form>
      </Card>
    </>
  );
};

export default ApplyLoanPage;
