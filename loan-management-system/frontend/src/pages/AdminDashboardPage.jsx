import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLoans, updateLoanStatus } from '../services/loan.service';
import { formatCurrency } from '../utils/format';
import './AdminDashboardPage.css';

const STATUS_FILTERS = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];

const statusClassName = (status) => status.toLowerCase().replace(/\s+/g, '-');

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
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

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <Link to="/" className="back-link">
            ← Home
          </Link>
          <h1>Admin Dashboard</h1>
          <p>Review pending applications, approve loans, or reject with remarks.</p>
        </div>
        <div className="admin-actions">
          <span>{user?.name}</span>
          <button type="button" className="secondary-button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="admin-toolbar">
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="secondary-button" onClick={loadLoans}>
          Refresh
        </button>
      </section>

      {error ? <p className="admin-error">{error}</p> : null}

      <section className="admin-table-wrapper">
        {loading ? (
          <p>Loading loans…</p>
        ) : loans.length === 0 ? (
          <p>No loans found for the selected filter.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Duration</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <strong>{loan.customer?.name}</strong>
                    <span>{loan.customer?.email}</span>
                  </td>
                  <td>{formatCurrency(loan.loanAmount)}</td>
                  <td>{loan.interestRate}%</td>
                  <td>{loan.durationMonths} mo</td>
                  <td>{loan.purpose}</td>
                  <td>
                    <span className={`status-badge status-${statusClassName(loan.status)}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td>{loan.remarks || '—'}</td>
                  <td className="action-cell">
                    {loan.status === 'Pending' ? (
                      <>
                        <button type="button" onClick={() => openAction(loan, 'Under Review')}>
                          Review
                        </button>
                        <button type="button" onClick={() => openAction(loan, 'Approved')}>
                          Approve
                        </button>
                        <button type="button" onClick={() => openAction(loan, 'Rejected')}>
                          Reject
                        </button>
                      </>
                    ) : null}
                    {loan.status === 'Under Review' ? (
                      <>
                        <button type="button" onClick={() => openAction(loan, 'Approved')}>
                          Approve
                        </button>
                        <button type="button" onClick={() => openAction(loan, 'Rejected')}>
                          Reject
                        </button>
                      </>
                    ) : null}
                    {loan.status === 'Approved' || loan.status === 'Rejected' ? (
                      <span className="muted-text">Finalized</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {actionLoan ? (
        <div className="modal-backdrop" role="presentation" onClick={closeAction}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>
              {actionLoan.nextStatus} loan #{actionLoan.id}
            </h2>
            <p>
              Customer: {actionLoan.customer?.name} · {formatCurrency(actionLoan.loanAmount)}
            </p>

            <label className="field">
              <span>
                Remarks{actionLoan.nextStatus === 'Rejected' ? ' (required)' : ' (optional)'}
              </span>
              <textarea
                rows="4"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Add review notes or rejection reason"
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={closeAction}>
                Cancel
              </button>
              <button type="button" onClick={handleStatusUpdate} disabled={submitting}>
                {submitting ? 'Saving…' : `Confirm ${actionLoan.nextStatus}`}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
};

export default AdminDashboardPage;
