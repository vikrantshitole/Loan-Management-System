import { Link, useParams } from 'react-router-dom';
import LoanPaymentsSection from '../components/LoanPaymentsSection';
import Loader from '../components/ui/Loader';
import PageHeader from '../components/layout/PageHeader';
import useLoan from '../hooks/useLoan';
import { formatCurrency } from '../utils/format';

const PaymentHistoryPage = () => {
  const { id } = useParams();
  const { loan, loading, error, reload } = useLoan(id);

  if (loading) {
    return <Loader fullPage label="Loading payment history…" />;
  }

  if (error || !loan) {
    return (
      <>
        <Link to="/dashboard" className="back-link">
          ← My Loans
        </Link>
        <p className="page-error">{error || 'Loan not found'}</p>
      </>
    );
  }

  return (
    <>
      <Link to={`/loans/${loan.id}`} className="back-link">
        ← Loan details
      </Link>

      <PageHeader
        title="Payment History"
        description={`${loan.purpose} · ${formatCurrency(loan.loanAmount)}`}
      />

      <LoanPaymentsSection
        loanId={loan.id}
        loanStatus={loan.status}
        outstandingBalance={loan.outstandingBalance}
        onPaymentRecorded={reload}
      />
    </>
  );
};

export default PaymentHistoryPage;
