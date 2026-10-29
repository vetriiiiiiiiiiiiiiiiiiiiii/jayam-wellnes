import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ExternalLink, FileText, LayoutDashboard, LogOut, Mail, Menu, Package, ShoppingBag, Star, Users, X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import '../../styles/jayam-admin.css';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/content', label: 'Site content', icon: FileText },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Mail },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/users', label: 'Users', icon: Users },
];

// The admin shell: only signed-in admins get past it.
export default function AdminLayout() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
  }, [loading, user, navigate, location.pathname]);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  if (loading || !user) return <div className="ad-loading" aria-busy="true">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="ad-denied">
        <img src="/jayam-logo.png" alt="" width="72" height="72" />
        <h1>This area is for the Jayam team.</h1>
        <p>You’re signed in as {user.email}, which doesn’t have admin access.</p>
        <div className="ad-row">
          <Link to="/" className="ad-btn">Back to the store</Link>
          <button type="button" className="ad-btn ad-btn--ghost" onClick={() => signOut().then(() => navigate('/login'))}>Sign in as someone else</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ad${menuOpen ? ' ad--menu' : ''}`}>
      <aside className="ad-side">
        <Link to="/admin" className="ad-brand">
          <img src="/jayam-logo.png" alt="" width="40" height="40" />
          <span><b>JAYAM</b><small>Store admin</small></span>
        </Link>
        <nav aria-label="Admin">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `ad-link${isActive ? ' is-active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ad-side-foot">
          <a href="/" target="_blank" rel="noreferrer" className="ad-link"><ExternalLink size={18} aria-hidden="true" /> View store</a>
          <div className="ad-me">
            {user.profilePicture ? <img src={user.profilePicture} alt="" referrerPolicy="no-referrer" /> : <span>{(user.fullname || user.email)[0].toUpperCase()}</span>}
            <div>
              <b>{user.fullname || 'Admin'}</b>
              <small>{user.email}</small>
            </div>
          </div>
          <button type="button" className="ad-link" onClick={() => signOut().then(() => navigate('/login'))}>
            <LogOut size={18} aria-hidden="true" /> Sign out
          </button>
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-top">
          <button type="button" className="ad-menu" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="ad-top-title">{LINKS.find((link) => (link.end ? location.pathname === link.to : location.pathname.startsWith(link.to)))?.label || 'Admin'}</span>
        </header>
        <div className="ad-content">
          <Outlet />
        </div>
      </div>
      {menuOpen && <button type="button" className="ad-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
