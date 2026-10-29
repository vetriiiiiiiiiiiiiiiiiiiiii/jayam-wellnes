import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

// Sign-in state for the storefront and the admin panel.
// The session lives in an httpOnly cookie set by the API; this only mirrors who is signed in.

const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
export const authApi = axios.create({ baseURL: `${base}/api/`, withCredentials: true });
export const GOOGLE_SIGN_IN_URL = `${base}/api/auth/google`;

export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.message || (error?.response ? fallback : 'We can’t reach the server right now. Please try again.');

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState({ google: false });

  const refresh = useCallback(async () => {
    try {
      const { data } = await authApi.get('auth/me');
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    authApi.get('auth/providers').then(({ data }) => setProviders(data)).catch(() => {});
  }, [refresh]);

  const signIn = useCallback(async (email, password) => {
    const { data } = await authApi.post('auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(async ({ fullname, email, password }) => {
    const { data } = await authApi.post('auth/signup', { fullname, email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.post('auth/logout').catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    providers,
    isAdmin: user?.role === 'admin',
    refresh,
    signIn,
    signUp,
    signOut,
    setUser,
  }), [user, loading, providers, refresh, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
