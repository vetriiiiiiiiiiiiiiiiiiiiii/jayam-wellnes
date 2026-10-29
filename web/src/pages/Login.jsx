import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthCard from '../components/storefront/AuthCard';
import { errorMessage, useAuth } from '../lib/auth';
import usePageMeta from '../lib/usePageMeta';

const GOOGLE_ERRORS = {
  google: 'Google sign-in didn’t complete. Please try again.',
  'google-unavailable': 'Google sign-in isn’t available right now. Please use your email.',
};

export default function Login() {
  usePageMeta({ title: 'Sign in', noindex: true });
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState(GOOGLE_ERRORS[params.get('error')] || '');
  const [busy, setBusy] = useState(false);
  const next = params.get('next');

  // Already signed in: go where they belong
  useEffect(() => {
    if (!loading && user) navigate(next || (user.role === 'admin' ? '/admin' : '/account'), { replace: true });
  }, [loading, user, navigate, next]);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const signedIn = await signIn(String(form.get('email')), String(form.get('password')));
      navigate(next || (signedIn.role === 'admin' ? '/admin' : '/account'), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back."
      sub="Sign in to see your orders — or to manage the store."
      footer={<>New to Jayam? <Link to="/register">Create an account</Link></>}
    >
      <form className="au-form" onSubmit={submit}>
        <label className="pg-field">Email
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label className="pg-field">
          <span className="au-label-row">Password <Link to="/forgot-password">Forgot password?</Link></span>
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        {error && <p className="pg-error" role="alert">{error}</p>}
        <button type="submit" className="ap-pill ap-pill--block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="au-note">You can always check out as a guest — an account just keeps your orders in one place.</p>
    </AuthCard>
  );
}
