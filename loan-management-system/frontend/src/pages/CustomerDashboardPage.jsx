import { Link } from 'react-router-dom';
import statusClassName from '../utils/status';
import { formatCurrency } from '../utils/format';
import './CustomerDashboardPage.css';

const CustomerDashboardPage = ({ loans, loading, error }) => {
  return (
    <main className="customer-dashboard">
      <header className="dashboard-header">
        <div>
          <Link to="/" className="back-link">
            ← Home
          </Link>
          <h1>My Loans</h1>
          <p>Track application status, approval remarks, EMI, and outstanding balance.</p>
        </div>
      </header>

      {error ? <p className="dashboard-error">{error}</p> : null}

      {loading ? (
        <p>Loading your loans…</p>
      ) : loans.length === 0 ? (
        <section className="empty-state">
          <h2>No loans yet</h2>
          <p>Apply for a loan to start tracking your application status here.</p>
        </section>
      ) : (
        <section className="loan-card-grid">
          {loans.map((loan) => (
            <article key={loan.id} className="loan-card">
              <div className="loan-card-top">
                <span className={`status-badge status-${statusClassName(loan.status)}`}>
                  {loan.status}
                </span>
                <span className="loan-date">
                  {new Date(loan.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>

              <h2>{formatCurrency(loan.loanAmount)}</h2>
              <p className="loan-purpose">{loan.purpose}</p>

              <dl className="loan-card-stats">
                <div>
                  <dt>Interest</dt>
                  <dd>{loan.interestRate}%</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{loan.durationMonths} months</dd>
                </div>
                <div>
                  <dt>EMI</dt>
                  <dd>{loan.emi ? formatCurrency(loan.emi) : '—'}</dd>
                </div>
                <div>
                  <dt>Outstanding</dt>
                  <dd>
                    {loan.outstandingBalance !== null
                      ? formatCurrency(loan.outstandingBalance)
                      : '—'}
                  </dd>
                </div>
              </dl>

              {loan.remarks ? <p className="loan-remarks">Remarks: {loan.remarks}</p> : null}

              <Link to={`/loans/${loan.id}`} className="loan-detail-link">
                View details
              </Link>
              {loan.status === 'Approved' ? (
                <Link to={`/loans/${loan.id}/payments`} className="loan-detail-link">
                  Payment history
                </Link>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default CustomerDashboardPage;
