import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        Loan Management
      </Link>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <span className="navbar-user">{user?.name}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
