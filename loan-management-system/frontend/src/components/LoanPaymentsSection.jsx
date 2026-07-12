import { useCallback, useEffect, useState } from 'react';
import { getPaymentHistory, recordPayment } from '../services/payment.service';
import Button from './ui/Button';
import Card from './ui/Card';
import FormField from './ui/FormField';
import Loader from './ui/Loader';
import Table from './ui/Table';
import { formatCurrency } from '../utils/format';
import { mapApiFieldErrors, validatePaymentAmount, visibleError } from '../utils/validation';

const PAYMENT_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount' },
  { key: 'remaining', label: 'Remaining balance' },
];

const LoanPaymentsSection = ({ loanId, loanStatus, outstandingBalance, onPaymentRecorded }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [amount, setAmount] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await getPaymentHistory(loanId);
      setHistory(data);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load payment history');
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
    setSubmitted(true);

    const validationErrors = validatePaymentAmount(amount, outstandingBalance);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await recordPayment({
        loanId: Number(loanId),
        amount: Number(amount),
      });
      setAmount('');
      setSubmitted(false);
      setTouched({});
      setFieldErrors({});
      await loadHistory();
      onPaymentRecorded?.();
    } catch (error) {
      const apiErrors = mapApiFieldErrors(error.response?.data?.errors);
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
      }
      setSubmitError(error.response?.data?.message || 'Unable to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="payments-card">
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

      {loadError ? <p className="page-error">{loadError}</p> : null}

      {canAddPayment ? (
        <form className="payment-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Payment amount"
            error={visibleError(fieldErrors, 'amount', touched, submitted)}
          >
            <input
              type="number"
              min="1"
              max={outstandingBalance}
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, amount: true }))}
              placeholder={`Max ${formatCurrency(outstandingBalance)}`}
            />
          </FormField>
          {submitError ? <p className="form-error">{submitError}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Recording…' : 'Add payment'}
          </Button>
        </form>
      ) : null}

      {loading ? (
        <Loader label="Loading payment history…" />
      ) : !history?.payments.length ? (
        <p className="muted-text">No payments recorded yet.</p>
      ) : (
        <Table columns={PAYMENT_COLUMNS}>
          {history.payments.map((payment) => (
            <tr key={payment.id}>
              <td>{new Date(payment.paymentDate).toLocaleString('en-IN')}</td>
              <td>{formatCurrency(payment.amount)}</td>
              <td>{formatCurrency(payment.remainingBalance)}</td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
};

export default LoanPaymentsSection;
