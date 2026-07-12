import { useCallback, useEffect, useState } from 'react';
import { getLoanById } from '../services/loan.service';

const useLoan = (loanId, errorMessage = 'Unable to load loan') => {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getLoanById(loanId);
      setLoan(data);
    } catch (loadError) {
      setError(loadError.response?.data?.message || errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loanId, errorMessage]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { loan, loading, error, reload };
};

export default useLoan;
