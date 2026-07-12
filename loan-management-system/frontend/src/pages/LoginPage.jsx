import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';
import useFormTouched from '../hooks/useFormTouched';
import { mapApiFieldErrors, validateLogin, visibleError } from '../utils/validation';

const LoginPage = () => {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const { touched, submitted, touch, markSubmitted } = useFormTouched();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    markSubmitted();

    const validationErrors = validateLogin(form);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await login({
        email: form.email.trim(),
        password: form.password,
      });
      const redirectTo =
        location.state?.from || (result.user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      const apiErrors = mapApiFieldErrors(loginError.response?.data?.errors);
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
      }
      setError(loginError.response?.data?.message || 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <Card title="Sign in" subtitle="Access your loan dashboard" className="auth-card">
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            error={visibleError(fieldErrors, 'email', touched, submitted)}
          >
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              onBlur={() => touch('email')}
              placeholder="you@example.com"
            />
          </FormField>

          <FormField
            label="Password"
            error={visibleError(fieldErrors, 'password', touched, submitted)}
          >
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              onBlur={() => touch('password')}
              placeholder="Enter password"
            />
          </FormField>

          {error ? <p className="form-error">{error}</p> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="muted-text mt-4">
          New customer? <Link to="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
