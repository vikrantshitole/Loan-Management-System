import { Link, useParams } from 'react-router-dom';
import LoanPaymentsSection from '../components/LoanPaymentsSection';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import StatusBadge from '../components/ui/StatusBadge';
import useLoan from '../hooks/useLoan';
import { formatCurrency } from '../utils/format';

const DetailItem = ({ label, value }) => (
  <div className="detail-item">
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

const LoanStatusPage = () => {
  const { id } = useParams();
  const { loan, loading, error, reload } = useLoan(id, 'Unable to load loan status');

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
            <p className="muted-text mt-4">
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
          onPaymentRecorded={reload}
        />
      ) : null}
    </>
  );
};

export default LoanStatusPage;
