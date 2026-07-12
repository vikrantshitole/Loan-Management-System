import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import * as authService from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FormField from '../components/ui/FormField';
import useFormTouched from '../hooks/useFormTouched';
import { mapApiFieldErrors, validateRegister, visibleError } from '../utils/validation';

const RegisterPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const { touched, submitted, touch, markSubmitted } = useFormTouched();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    markSubmitted();

    const validationErrors = validateRegister(form);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    try {
      await authService.register(payload);
      await login(payload);
      navigate('/dashboard', { replace: true });
    } catch (registerError) {
      const apiErrors = mapApiFieldErrors(registerError.response?.data?.errors);
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
      }
      setError(registerError.response?.data?.message || 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <Card title="Create account" subtitle="Register as a customer" className="auth-card">
        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Full name" error={visibleError(fieldErrors, 'name', touched, submitted)}>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              onBlur={() => touch('name')}
            />
          </FormField>

          <FormField label="Email" error={visibleError(fieldErrors, 'email', touched, submitted)}>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              onBlur={() => touch('email')}
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
            />
          </FormField>

          {error ? <p className="form-error">{error}</p> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Register'}
          </Button>
        </form>

        <p className="muted-text mt-4">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
