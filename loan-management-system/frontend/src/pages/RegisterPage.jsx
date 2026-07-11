import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import * as authService from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';

const RegisterPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await authService.register(form);
      await login({ email: form.email, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (registerError) {
      setError(registerError.response?.data?.message || 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <Card title="Create account" subtitle="Register as a customer" className="auth-card">
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Full name">
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </FormField>

          <FormField label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </FormField>

          <FormField label="Password">
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              minLength={6}
              required
            />
          </FormField>

          {error ? <p className="form-error">{error}</p> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </Button>
        </form>

        <p className="muted-text" style={{ marginTop: '1rem' }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
