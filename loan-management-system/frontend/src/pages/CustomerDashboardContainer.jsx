import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLoans } from '../services/loan.service';
import CustomerDashboardPage from './CustomerDashboardPage';

const CustomerDashboardContainer = () => {
  const { isAdmin } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLoans = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getLoans();
      setLoans(result.loans);
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to load your loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <CustomerDashboardPage loans={loans} loading={loading} error={error} />;
};

export default CustomerDashboardContainer;
