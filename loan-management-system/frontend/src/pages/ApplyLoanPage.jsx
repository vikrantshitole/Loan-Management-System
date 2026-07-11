import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';
import { applyForLoan } from '../services/loan.service';
import { LOAN_LIMITS } from '../utils/format';

const ApplyLoanPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loanAmount: '',
    interestRate: String(LOAN_LIMITS.defaultInterestRate),
    durationMonths: '',
    purpose: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const loan = await applyForLoan({
        loanAmount: Number(form.loanAmount),
        interestRate: Number(form.interestRate),
        durationMonths: Number(form.durationMonths),
        purpose: form.purpose.trim(),
      });
      navigate(`/loans/${loan.id}`);
    } catch (submitError) {
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
            <FormField label="Loan amount">
              <input
                type="number"
                min="1"
                max={LOAN_LIMITS.maxAmount}
                value={form.loanAmount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, loanAmount: event.target.value }))
                }
                required
              />
            </FormField>

            <FormField label="Annual interest rate (%)">
              <input
                type="number"
                min={LOAN_LIMITS.minInterestRate}
                max={LOAN_LIMITS.maxInterestRate}
                step="0.1"
                value={form.interestRate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, interestRate: event.target.value }))
                }
                required
              />
            </FormField>

            <FormField label="Duration (months)">
              <input
                type="number"
                min={LOAN_LIMITS.minDurationMonths}
                max={LOAN_LIMITS.maxDurationMonths}
                value={form.durationMonths}
                onChange={(event) =>
                  setForm((current) => ({ ...current, durationMonths: event.target.value }))
                }
                required
              />
            </FormField>
          </div>

          <FormField label="Purpose">
            <textarea
              rows="4"
              value={form.purpose}
              onChange={(event) =>
                setForm((current) => ({ ...current, purpose: event.target.value }))
              }
              placeholder="Describe why you need this loan"
              required
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
