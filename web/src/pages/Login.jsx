import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/account');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-pearl pt-24">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-sm border border-brand-green-100 w-full max-w-md">
        <h1 className="text-4xl font-serif text-brand-dark mb-8 tracking-tighter text-center">Login</h1>

        {error && <p className="text-red-500 text-sm mb-6 text-center">{error}</p>}

        <div className="mb-5">
          <label className="block text-xs font-medium uppercase tracking-widest text-brand-dark mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-brand-green-100 focus:border-brand-green-500 outline-none transition-all"
            required
          />
        </div>

        <div className="mb-8">
          <label className="block text-xs font-medium uppercase tracking-widest text-brand-dark mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-brand-green-100 focus:border-brand-green-500 outline-none transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium tracking-wide hover:bg-brand-forest-700 transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-brand-dark/60 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-dark underline hover:text-brand-gold">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
