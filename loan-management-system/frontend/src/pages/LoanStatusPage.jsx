import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLoanById } from '../services/loan.service';
import LoanPaymentsSection from '../components/LoanPaymentsSection';
import statusClassName from '../utils/status';
import { formatCurrency } from '../utils/format';
import './LoanStatusPage.css';

const DetailItem = ({ label, value }) => (
  <div className="detail-item">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

const LoanStatusPage = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLoan = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getLoanById(id);
      setLoan(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load loan status');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLoan();
  }, [loadLoan]);

  if (loading) {
    return <main className="loan-status-page">Loading loan status…</main>;
  }

  if (error) {
    return (
      <main className="loan-status-page">
        <Link to="/dashboard" className="back-link">
          ← My Loans
        </Link>
        <p className="status-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="loan-status-page">
      <Link to="/dashboard" className="back-link">
        ← My Loans
      </Link>

      <header className="status-header">
        <div>
          <span className={`status-badge status-${statusClassName(loan.status)}`}>
            {loan.status}
          </span>
          <h1>{formatCurrency(loan.loanAmount)}</h1>
          <p>{loan.purpose}</p>
        </div>
        <div className="status-meta">
          <span>Applied on {new Date(loan.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
      </header>

      <section className="status-grid">
        <article className="status-panel">
          <h2>Loan details</h2>
          <dl className="detail-grid">
            <DetailItem label="Interest rate" value={`${loan.interestRate}%`} />
            <DetailItem label="Duration" value={`${loan.durationMonths} months`} />
            <DetailItem label="Monthly EMI" value={loan.emi ? formatCurrency(loan.emi) : '—'} />
            <DetailItem
              label="Total payment"
              value={
                loan.emiBreakdown?.totalPayment
                  ? formatCurrency(loan.emiBreakdown.totalPayment)
                  : '—'
              }
            />
            <DetailItem
              label="Total interest"
              value={
                loan.emiBreakdown?.totalInterest
                  ? formatCurrency(loan.emiBreakdown.totalInterest)
                  : '—'
              }
            />
            <DetailItem
              label="Outstanding balance"
              value={
                loan.outstandingBalance !== null
                  ? formatCurrency(loan.outstandingBalance)
                  : '—'
              }
            />
            <DetailItem label="Total paid" value={formatCurrency(loan.totalPaid || 0)} />
          </dl>
        </article>

        <article className="status-panel">
          <h2>Approval remarks</h2>
          {loan.remarks ? (
            <p className="remarks-box">{loan.remarks}</p>
          ) : (
            <p className="muted-text">No remarks have been added yet.</p>
          )}

          {loan.approver ? (
            <p className="reviewer-note">
              Reviewed by {loan.approver.name} ({loan.approver.email})
            </p>
          ) : null}
        </article>
      </section>

      {loan.status === 'Approved' ? (
        <LoanPaymentsSection
          loanId={loan.id}
          loanStatus={loan.status}
          outstandingBalance={loan.outstandingBalance}
          onPaymentRecorded={loadLoan}
        />
      ) : null}
    </main>
  );
};

export default LoanStatusPage;
