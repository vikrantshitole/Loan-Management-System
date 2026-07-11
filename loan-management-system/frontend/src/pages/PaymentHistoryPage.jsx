import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoanPaymentsSection from '../components/LoanPaymentsSection';
import { getLoanById } from '../services/loan.service';
import { formatCurrency } from '../utils/format';
import './PaymentHistoryPage.css';

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
    return <main className="payment-history-page">Loading payment history…</main>;
  }

  if (error || !loan) {
    return (
      <main className="payment-history-page">
        <Link to="/dashboard" className="back-link">
          ← My Loans
        </Link>
        <p className="history-error">{error || 'Loan not found'}</p>
      </main>
    );
  }

  return (
    <main className="payment-history-page">
      <Link to={`/loans/${loan.id}`} className="back-link">
        ← Loan details
      </Link>

      <header className="history-header">
        <h1>Payment History</h1>
        <p>
          {loan.purpose} · {formatCurrency(loan.loanAmount)}
        </p>
      </header>

      <LoanPaymentsSection
        loanId={loan.id}
        loanStatus={loan.status}
        outstandingBalance={loan.outstandingBalance}
        onPaymentRecorded={loadLoan}
      />
    </main>
  );
};

export default PaymentHistoryPage;
