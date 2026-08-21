import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignUp, GOOGLE_AUTH_URL } from '../services/api';
import { useApp } from '../context/Appcontext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser, isValidating } = useApp();

  React.useEffect(() => {
    if (!isValidating && user) {
      navigate('/account');
    }
  }, [user, isValidating, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log("Registering new user...");
    // Assuming confirmPassword is the same as password for this UI
    const res = await SignUp(name, email, password, password);
    
    if (res.success) {
      console.log("Registration successful! Data:", res);
      setUser(res.user);
      navigate('/account');
    } else {
      console.error("Registration failed:", res.message);
      setError(res.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-pearl pt-24">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-2xl shadow-sm border border-brand-green-100 w-full max-w-md">
        <h1 className="text-4xl font-serif text-brand-dark mb-8 tracking-tighter text-center">Create Account</h1>

        {error && <p className="text-red-500 text-sm mb-6 text-center">{error}</p>}

        <div className="mb-5">
          <label className="block text-xs font-medium uppercase tracking-widest text-brand-dark mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-brand-green-100 focus:border-brand-green-500 outline-none transition-all"
            required
          />
        </div>

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
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-brand-green-100"></div>
          <span className="px-4 text-sm text-brand-dark/50">OR</span>
          <div className="flex-1 border-t border-brand-green-100"></div>
        </div>

        <button
          type="button"
          onClick={() => {
            console.log("Redirecting to Google Auth from Register...");
            window.location.href = GOOGLE_AUTH_URL;
          }}
          className="w-full py-4 bg-white border-2 border-brand-green-100 text-brand-dark rounded-xl font-medium tracking-wide hover:bg-brand-pearl transition-colors duration-300 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-brand-dark/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-dark underline hover:text-brand-gold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
