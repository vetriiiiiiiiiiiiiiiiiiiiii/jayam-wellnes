import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthCard from '../components/storefront/AuthCard';
import { authApi, errorMessage, useAuth } from '../lib/auth';
import usePageMeta from '../lib/usePageMeta';

export default function ResetPassword() {
  usePageMeta({ title: 'Choose a new password', noindex: true });
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState(token ? '' : 'This reset link is incomplete. Please request a new one.');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('confirm')) {
      setError('The two passwords don’t match');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await authApi.post('auth/reset-password', { token, password: form.get('password') });
      setUser(data.user);
      navigate(data.user.role === 'admin' ? '/admin' : '/account', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Choose a new password."
      google={false}
      footer={<><Link to="/forgot-password">Request a new link</Link></>}
    >
      <form className="au-form" onSubmit={submit}>
        <label className="pg-field">New password
          <input type="password" name="password" autoComplete="new-password" required minLength={8} disabled={!token} />
        </label>
        <label className="pg-field">Confirm new password
          <input type="password" name="confirm" autoComplete="new-password" required minLength={8} disabled={!token} />
        </label>
        <p className="au-note au-note--left">At least 8 characters, with a letter and a number.</p>
        {error && <p className="pg-error" role="alert">{error}</p>}
        <button type="submit" className="ap-pill ap-pill--block" disabled={busy || !token}>{busy ? 'Saving…' : 'Save new password'}</button>
      </form>
    </AuthCard>
  );
}
