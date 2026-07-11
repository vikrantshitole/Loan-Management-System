import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';

const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="public-page">
      <PageHero
        title="Loan Management System"
        description="Apply for loans, track approval status, calculate EMI, and manage payments in one place."
      />

      <div className="grid-auto">
        <Card title="Customer portal" subtitle="Apply, track, and pay">
          <p className="muted-text">
            Submit loan applications, monitor approval status, and view payment history.
          </p>
          <div className="hero-actions">
            {isAuthenticated && !isAdmin ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </Card>

        <Card title="EMI calculator" subtitle="Plan before you apply">
          <p className="muted-text">
            Estimate monthly EMI with live calculation verified by the backend API.
          </p>
          <Link to="/emi-calculator" className="btn btn-secondary">
            Open calculator
          </Link>
        </Card>

        <Card title="Admin portal" subtitle="Review and approve">
          <p className="muted-text">
            Review pending applications, approve or reject loans, and add remarks.
          </p>
          <Link to={isAdmin ? '/admin' : '/login'} className="btn btn-secondary">
            Admin dashboard
          </Link>
        </Card>
      </div>
    </div>
  );
};

const PageHero = ({ title, description }) => (
  <header className="page-header">
    <h1>{title}</h1>
    <p>{description}</p>
  </header>
);

export default HomePage;
