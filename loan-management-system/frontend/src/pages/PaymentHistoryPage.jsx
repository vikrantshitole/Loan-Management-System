import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoanPaymentsSection from '../components/LoanPaymentsSection';
import Loader from '../components/ui/Loader';
import PageHeader from '../components/layout/PageHeader';
import { getLoanById } from '../services/loan.service';
import { formatCurrency } from '../utils/format';

const PaymentHistoryPage = () => {
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
      setError(loadError.response?.data?.message || 'Unable to load loan');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLoan();
  }, [loadLoan]);

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
        onPaymentRecorded={loadLoan}
      />
    </>
  );
};

export default PaymentHistoryPage;
