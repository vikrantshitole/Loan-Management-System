import { Link } from 'react-router-dom';
import useEmiCalculator from '../hooks/useEmiCalculator';
import { formatCurrency, LOAN_LIMITS } from '../utils/format';
import './EmiCalculatorPage.css';

const FieldError = ({ show, message }) => {
  if (!show || !message) {
    return null;
  }

  return <p className="field-error">{message}</p>;
};

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
    <main className="emi-page">
      <header className="emi-header">
        <Link to="/" className="back-link">
          ← Home
        </Link>
        <h1>EMI Calculator</h1>
        <p>
          Live calculation using the reducing-balance formula, verified against the backend API.
        </p>
      </header>

      <section className="emi-layout">
        <form
          className="emi-form"
          onSubmit={(event) => event.preventDefault()}
          noValidate
        >
          <label className="field">
            <span>Loan amount</span>
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
            <FieldError show={touched.loanAmount} message={errors.loanAmount} />
          </label>

          <label className="field">
            <span>Annual interest rate (%)</span>
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
            <FieldError show={touched.interestRate} message={errors.interestRate} />
          </label>

          <label className="field">
            <span>Duration (months)</span>
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
            <FieldError show={touched.durationMonths} message={errors.durationMonths} />
          </label>

          <button type="button" className="secondary-button" onClick={reset}>
            Reset
          </button>
        </form>

        <aside className="emi-result" aria-live="polite">
          {!liveResult ? (
            <div className="emi-empty">
              <h2>Breakdown</h2>
              <p>Enter a valid amount, rate, and duration to see live EMI results.</p>
            </div>
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
        </aside>
      </section>

      <section className="emi-formula">
        <h2>Formula</h2>
        <p>
          EMI = P × R × (1+R)<sup>N</sup> / ((1+R)<sup>N</sup> − 1)
        </p>
        <p>
          P = principal, R = monthly interest rate, N = tenure in months.
        </p>
      </section>
    </main>
  );
};

export default EmiCalculatorPage;
