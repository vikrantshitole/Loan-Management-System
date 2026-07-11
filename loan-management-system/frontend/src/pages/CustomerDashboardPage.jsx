import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/layout/PageHeader';
import { formatCurrency } from '../utils/format';

const CustomerDashboardPage = ({ loans, loading, error }) => {
  return (
    <>
      <PageHeader
        title="My Loans"
        description="Track application status, approval remarks, EMI, and outstanding balance."
        actions={
          <Link to="/apply-loan" className="btn btn-primary">
            Apply for loan
          </Link>
        }
      />

      {error ? <p className="page-error">{error}</p> : null}

      {loading ? (
        <Loader fullPage label="Loading your loans…" />
      ) : loans.length === 0 ? (
        <Card title="No loans yet" subtitle="Start by submitting your first application">
          <p className="muted-text">
            Apply for a loan to start tracking your application status here.
          </p>
          <div className="hero-actions">
            <Link to="/apply-loan" className="btn btn-primary">
              Apply for loan
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid-auto">
          {loans.map((loan) => (
            <Card key={loan.id}>
              <div className="loan-card-top">
                <StatusBadge status={loan.status} />
                <span className="loan-date">
                  {new Date(loan.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>

              <h2 className="loan-amount">{formatCurrency(loan.loanAmount)}</h2>
              <p className="loan-purpose">{loan.purpose}</p>

              <dl className="stat-grid">
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

              {loan.remarks ? (
                <p className="remarks-box">Remarks: {loan.remarks}</p>
              ) : null}

              <div className="card-actions">
                <Link to={`/loans/${loan.id}`}>View details</Link>
                {loan.status === 'Approved' ? (
                  <Link to={`/loans/${loan.id}/payments`}>Payment history</Link>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default CustomerDashboardPage;
