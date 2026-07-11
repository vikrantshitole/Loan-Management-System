import { useCallback, useEffect, useState } from 'react';
import { getPaymentHistory, recordPayment } from '../services/payment.service';
import { formatCurrency } from '../utils/format';
import './LoanPaymentsSection.css';

const LoanPaymentsSection = ({ loanId, loanStatus, outstandingBalance, onPaymentRecorded }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getPaymentHistory(loanId);
      setHistory(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load payment history');
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const canAddPayment =
    loanStatus === 'Approved' && outstandingBalance !== null && outstandingBalance > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await recordPayment({
        loanId: Number(loanId),
        amount: Number(amount),
      });
      setAmount('');
      await loadHistory();
      onPaymentRecorded?.();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="payments-section">
      <div className="payments-header">
        <h2>Payment history</h2>
        {history ? (
          <div className="payments-summary">
            <span>Total paid: {formatCurrency(history.totalPaid)}</span>
            <span>
              Remaining:{' '}
              {history.remainingBalance !== null
                ? formatCurrency(history.remainingBalance)
                : '—'}
            </span>
          </div>
        ) : null}
      </div>

      {error ? <p className="payments-error">{error}</p> : null}

      {canAddPayment ? (
        <form className="payment-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Payment amount</span>
            <input
              type="number"
              min="1"
              max={outstandingBalance}
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={`Max ${formatCurrency(outstandingBalance)}`}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Recording…' : 'Add payment'}
          </button>
        </form>
      ) : null}

      {loading ? (
        <p>Loading payment history…</p>
      ) : !history?.payments.length ? (
        <p className="muted-text">No payments recorded yet.</p>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Remaining balance</th>
              </tr>
            </thead>
            <tbody>
              {history.payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.paymentDate).toLocaleString('en-IN')}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{formatCurrency(payment.remainingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default LoanPaymentsSection;
