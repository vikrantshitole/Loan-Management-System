import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getLoanById } from '../services/loan.service';
import LoanPaymentsSection from '../components/LoanPaymentsSection';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import StatusBadge from '../components/ui/StatusBadge';
import { formatCurrency } from '../utils/format';

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
    return <Loader fullPage label="Loading loan status…" />;
  }

  if (error) {
    return (
      <>
        <Link to="/dashboard" className="back-link">
          ← My Loans
        </Link>
        <p className="page-error">{error}</p>
      </>
    );
  }

  return (
    <>
      <Link to="/dashboard" className="back-link">
        ← My Loans
      </Link>

      <header className="loan-status-header">
        <div>
          <StatusBadge status={loan.status} />
          <h1>{formatCurrency(loan.loanAmount)}</h1>
          <p className="loan-purpose">{loan.purpose}</p>
        </div>
        <div className="muted-text">
          Applied on {new Date(loan.createdAt).toLocaleDateString('en-IN')}
        </div>
      </header>

      <section className="status-grid">
        <Card title="Loan details">
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
        </Card>

        <Card title="Approval remarks">
          {loan.remarks ? (
            <p className="remarks-box">{loan.remarks}</p>
          ) : (
            <p className="muted-text">No remarks have been added yet.</p>
          )}

          {loan.approver ? (
            <p className="muted-text" style={{ marginTop: '1rem' }}>
              Reviewed by {loan.approver.name} ({loan.approver.email})
            </p>
          ) : null}
        </Card>
      </section>

      {loan.status === 'Approved' ? (
        <LoanPaymentsSection
          loanId={loan.id}
          loanStatus={loan.status}
          outstandingBalance={loan.outstandingBalance}
          onPaymentRecorded={loadLoan}
        />
      ) : null}
    </>
  );
};

export default LoanStatusPage;
