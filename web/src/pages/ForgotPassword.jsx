import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../components/storefront/AuthCard';
import { authApi, errorMessage } from '../lib/auth';
import usePageMeta from '../lib/usePageMeta';

export default function ForgotPassword() {
  usePageMeta({ title: 'Reset your password', noindex: true });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email'));
    setStatus('sending');
    try {
      const { data } = await authApi.post('auth/forgot-password', { email });
      setMessage(data.message);
      setStatus('sent');
    } catch (err) {
      setMessage(errorMessage(err));
      setStatus('idle');
    }
  };

  return (
    <AuthCard
      title="Reset your password."
      sub="Enter your email and we’ll send you a link to choose a new one."
      google={false}
      footer={<><Link to="/login">Back to sign in</Link></>}
    >
      {status === 'sent' ? (
        <p className="au-done" role="status">{message}</p>
      ) : (
        <form className="au-form" onSubmit={submit}>
          <label className="pg-field">Email
            <input type="email" name="email" autoComplete="email" required />
          </label>
          {message && <p className="pg-error" role="alert">{message}</p>}
          <button type="submit" className="ap-pill ap-pill--block" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
