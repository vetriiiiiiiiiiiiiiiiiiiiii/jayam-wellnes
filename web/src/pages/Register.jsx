import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/storefront/AuthCard';
import { errorMessage, useAuth } from '../lib/auth';
import usePageMeta from '../lib/usePageMeta';

export default function Register() {
  usePageMeta({ title: 'Create an account', noindex: true });
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate(user.role === 'admin' ? '/admin' : '/account', { replace: true });
  }, [loading, user, navigate]);

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
      const created = await signUp({
        fullname: String(form.get('fullname')),
        email: String(form.get('email')),
        password: String(form.get('password')),
      });
      navigate(created.role === 'admin' ? '/admin' : '/account', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Create your account."
      sub="Keep your orders, receipts and tracking in one place."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form className="au-form" onSubmit={submit}>
        <label className="pg-field">Full name
          <input type="text" name="fullname" autoComplete="name" required maxLength={120} />
        </label>
        <label className="pg-field">Email
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <div className="pg-row">
          <label className="pg-field">Password
            <input type="password" name="password" autoComplete="new-password" required minLength={8} />
          </label>
          <label className="pg-field">Confirm password
            <input type="password" name="confirm" autoComplete="new-password" required minLength={8} />
          </label>
        </div>
        <p className="au-note au-note--left">At least 8 characters, with a letter and a number.</p>
        {error && <p className="pg-error" role="alert">{error}</p>}
        <button type="submit" className="ap-pill ap-pill--block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="au-note">
        By creating an account you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </AuthCard>
  );
}
