import { useCallback, useEffect, useState } from 'react';
import { getLoans, updateLoanStatus } from '../services/loan.service';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import Table from '../components/ui/Table';
import { formatCurrency } from '../utils/format';

const STATUS_FILTERS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];

const ADMIN_COLUMNS = [
  { key: 'customer', label: 'Customer' },
  { key: 'amount', label: 'Amount' },
  { key: 'rate', label: 'Rate' },
  { key: 'duration', label: 'Duration' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'status', label: 'Status' },
  { key: 'remarks', label: 'Remarks' },
  { key: 'actions', label: 'Actions' },
];

const AdminDashboardPage = () => {
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoan, setActionLoan] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = statusFilter === 'All' ? {} : { status: statusFilter };
      const result = await getLoans(params);
      setLoans(result.loans);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const openAction = (loan, nextStatus) => {
    setActionLoan({ ...loan, nextStatus });
    setRemarks(loan.remarks || '');
  };

  const closeAction = () => {
    setActionLoan(null);
    setRemarks('');
  };

  const handleStatusUpdate = async () => {
    if (!actionLoan) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await updateLoanStatus(actionLoan.id, {
        status: actionLoan.nextStatus,
        remarks: remarks.trim() || undefined,
      });
      closeAction();
      await loadLoans();
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Unable to update loan status');
    } finally {
      setSubmitting(false);
    }
  };

  const renderActions = (loan) => {
    if (loan.status === 'Pending') {
      return (
        <>
          <Button size="sm" variant="secondary" onClick={() => openAction(loan, 'Under Review')}>
            Review
          </Button>
          <Button size="sm" onClick={() => openAction(loan, 'Approved')}>
            Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => openAction(loan, 'Rejected')}>
            Reject
          </Button>
        </>
      );
    }

    if (loan.status === 'Under Review') {
      return (
        <>
          <Button size="sm" onClick={() => openAction(loan, 'Approved')}>
            Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => openAction(loan, 'Rejected')}>
            Reject
          </Button>
        </>
      );
    }

    if (loan.status === 'Approved' || loan.status === 'Rejected') {
      return <span className="muted-text">Finalized</span>;
    }

    return null;
  };

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Review pending applications, approve loans, or reject with remarks."
      />

      <section className="admin-toolbar">
        <FormField label="Status">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FormField>
        <Button variant="secondary" onClick={loadLoans}>
          Refresh
        </Button>
      </section>

      {error ? <p className="page-error">{error}</p> : null}

      {loading ? (
        <Loader fullPage label="Loading loans…" />
      ) : (
        <Table columns={ADMIN_COLUMNS} emptyMessage="No loans found for the selected filter.">
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td>
                <strong>{loan.customer?.name}</strong>
                <div className="muted-text">{loan.customer?.email}</div>
              </td>
              <td>{formatCurrency(loan.loanAmount)}</td>
              <td>{loan.interestRate}%</td>
              <td>{loan.durationMonths} mo</td>
              <td>{loan.purpose}</td>
              <td>
                <StatusBadge status={loan.status} />
              </td>
              <td>{loan.remarks || '—'}</td>
              <td className="action-cell">{renderActions(loan)}</td>
            </tr>
          ))}
        </Table>
      )}

      {actionLoan ? (
        <Modal
          title={`${actionLoan.nextStatus} loan #${actionLoan.id}`}
          description={`Customer: ${actionLoan.customer?.name} · ${formatCurrency(actionLoan.loanAmount)}`}
          onClose={closeAction}
          actions={
            <>
              <Button variant="secondary" onClick={closeAction}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={submitting}>
                {submitting ? 'Saving…' : `Confirm ${actionLoan.nextStatus}`}
              </Button>
            </>
          }
        >
          <FormField
            label={`Remarks${actionLoan.nextStatus === 'Rejected' ? ' (required)' : ' (optional)'}`}
          >
            <textarea
              rows="4"
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Add review notes or rejection reason"
            />
          </FormField>
        </Modal>
      ) : null}
    </>
  );
};

export default AdminDashboardPage;
