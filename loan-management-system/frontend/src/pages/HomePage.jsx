import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const HomePage = () => {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get('/health');
        setApiStatus('connected');
      } catch {
        setApiStatus('disconnected');
      }
    };

    checkHealth();
  }, []);

  return (
    <main className="home-page">
      <h1>Loan Management System</h1>
      <p>Customer loan applications, admin approvals, EMI calculator, and payment tracking.</p>
      <p>
        API status:{' '}
        <strong>{apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</strong>
      </p>
      <nav className="home-nav">
        <Link to="/emi-calculator">EMI Calculator</Link>
      </nav>
    </main>
  );
};

export default HomePage;
