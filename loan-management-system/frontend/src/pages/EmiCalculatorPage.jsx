import useEmiCalculator from '../hooks/useEmiCalculator';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';
import PageHeader from '../components/layout/PageHeader';
import { formatCurrency, LOAN_LIMITS } from '../utils/format';
import { visibleError } from '../utils/validation';

const EmiCalculatorPage = () => {
  const {
    values,
    errors,
    touched,
    liveResult,
    verifyStatus,
    verifyError,
    matchesServer,
    updateField,
    touchField,
    reset,
  } = useEmiCalculator();

  return (
    <div className="public-page">
      <PageHeader
        title="EMI Calculator"
        description="Live calculation using the reducing-balance formula, verified against the backend API."
      />

      <section className="emi-layout">
        <Card title="Loan inputs">
          <form onSubmit={(event) => event.preventDefault()} noValidate>
            <FormField
              label="Loan amount"
              error={visibleError(errors, 'loanAmount', touched, false)}
            >
              <input
                type="number"
                name="loanAmount"
                min="1"
                max={LOAN_LIMITS.maxAmount}
                step="1000"
                value={values.loanAmount}
                onChange={(event) => updateField('loanAmount', event.target.value)}
                onBlur={() => touchField('loanAmount')}
                placeholder="e.g. 500000"
              />
            </FormField>

            <FormField
              label="Annual interest rate (%)"
              error={visibleError(errors, 'interestRate', touched, false)}
            >
              <input
                type="number"
                name="interestRate"
                min={LOAN_LIMITS.minInterestRate}
                max={LOAN_LIMITS.maxInterestRate}
                step="0.1"
                value={values.interestRate}
                onChange={(event) => updateField('interestRate', event.target.value)}
                onBlur={() => touchField('interestRate')}
                placeholder="e.g. 10"
              />
            </FormField>

            <FormField
              label="Duration (months)"
              error={visibleError(errors, 'durationMonths', touched, false)}
            >
              <input
                type="number"
                name="durationMonths"
                min={LOAN_LIMITS.minDurationMonths}
                max={LOAN_LIMITS.maxDurationMonths}
                step="1"
                value={values.durationMonths}
                onChange={(event) => updateField('durationMonths', event.target.value)}
                onBlur={() => touchField('durationMonths')}
                placeholder="e.g. 24"
              />
            </FormField>

            <Button type="button" variant="secondary" onClick={reset}>
              Reset
            </Button>
          </form>
        </Card>

        <Card title="Breakdown" aria-live="polite">
          {!liveResult ? (
            <p className="muted-text">
              Enter a valid amount, rate, and duration to see live EMI results.
            </p>
          ) : (
            <>
              <div className="emi-highlight">
                <p className="emi-label">Monthly EMI</p>
                <p className="emi-value">{formatCurrency(liveResult.emi)}</p>
              </div>

              <dl className="emi-stats">
                <div>
                  <dt>Principal</dt>
                  <dd>{formatCurrency(liveResult.breakdown.principal)}</dd>
                </div>
                <div>
                  <dt>Total interest</dt>
                  <dd>{formatCurrency(liveResult.totalInterest)}</dd>
                </div>
                <div>
                  <dt>Total payment</dt>
                  <dd>{formatCurrency(liveResult.totalPayment)}</dd>
                </div>
                <div>
                  <dt>Monthly rate</dt>
                  <dd>{liveResult.monthlyInterestRate}%</dd>
                </div>
                <div>
                  <dt>Tenure</dt>
                  <dd>{liveResult.durationMonths} months</dd>
                </div>
              </dl>

              <div className={`verify-badge verify-${verifyStatus}`}>
                {verifyStatus === 'verifying' && 'Verifying with server…'}
                {verifyStatus === 'verified' && matchesServer && 'Verified by server'}
                {verifyStatus === 'verified' && !matchesServer && 'Server result differs'}
                {verifyStatus === 'error' && (verifyError || 'Verification failed')}
                {verifyStatus === 'idle' && 'Waiting for input'}
              </div>
            </>
          )}
        </Card>
      </section>

      <Card title="Formula" className="formula-card">
        <p className="muted-text">
          EMI = P × R × (1+R)<sup>N</sup> / ((1+R)<sup>N</sup> − 1)
        </p>
        <p className="muted-text">P = principal, R = monthly interest rate, N = tenure in months.</p>
      </Card>
    </div>
  );
};

export default EmiCalculatorPage;
