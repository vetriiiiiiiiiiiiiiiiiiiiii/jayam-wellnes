import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import CartDrawer from './CartDrawer';
import { useCart } from './CartProvider';
import { useAuth } from '../../lib/auth';

const LINKS = [
  { label: 'Shop', to: '/shop' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Contact', to: '/contact' },
];

// Navigation: the Jayam mark and lettering, links on a soft track with a white pill that
// glides to the link under the pointer (and rests on the current page), search, account
// and bag, and the free-shipping ribbon. The bar gains a shadow once the page scrolls.
export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });
  const searchRef = useRef(null);
  const headerRef = useRef(null);
  const linksRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener('jayam:cart-open', openCart);
    return () => window.removeEventListener('jayam:cart-open', openCart);
  }, []);

  // Close menus when the page changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Move the pill under a link, or back to the current page's link (hidden on other pages)
  const placePill = useCallback((link) => {
    const target = link || linksRef.current?.querySelector('a.active');
    if (!target) return setPill((current) => ({ ...current, visible: false }));
    // Measure against the track (each link's own offset is relative to its list item)
    const track = linksRef.current.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    setPill({ left: box.left - track.left - linksRef.current.clientLeft, width: box.width, visible: true });
  }, []);

  useLayoutEffect(() => {
    placePill();
    const onResize = () => placePill();
    window.addEventListener('resize', onResize);
    document.fonts?.ready.then(onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [location.pathname, placePill]);

  // Publish the header height so sticky bars (like the product sub-nav) sit right below it
  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className={`an${scrolled ? ' is-scrolled' : ''}`} ref={headerRef}>
        <nav className="an-bar" aria-label="Main">
          <button type="button" className="an-icon an-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
          </button>

          <Link to="/" className="an-logo" aria-label="Jayam Wellness home">
            <span className="an-logo-mark"><img src="/jayam-triangle.png" alt="" width="302" height="228" /></span>
            <img className="an-wordmark-img" src="/jayam-wordmark.png" alt="" width="231" height="58" />
          </Link>

          <ul className="an-links" ref={linksRef} onMouseLeave={() => placePill()}>
            <li className="an-pill" aria-hidden="true" style={{ transform: `translateX(${pill.left}px)`, width: pill.width, opacity: pill.visible ? 1 : 0 }} />
            {LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink to={to} onMouseEnter={(event) => placePill(event.currentTarget)} onFocus={(event) => placePill(event.currentTarget)}>{label}</NavLink>
              </li>
            ))}
          </ul>

          <div className="an-actions">
            <button type="button" className="an-icon" aria-label="Search products" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}>
              <Search size={18} strokeWidth={1.7} />
            </button>
            <Link to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} className="an-icon an-account" aria-label={user ? 'Your account' : 'Sign in'}>
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="" className="an-avatar" referrerPolicy="no-referrer" />
                : <User size={18} strokeWidth={1.7} />}
            </Link>
            <button type="button" className="an-icon an-bag" aria-label={`Open bag, ${cartCount} items`} onClick={() => setCartOpen(true)}>
              <ShoppingBag size={18} strokeWidth={1.7} />
              {cartCount > 0 && <span className="an-bag-count">{cartCount}</span>}
            </button>
          </div>
        </nav>

        {searchOpen && (
          <form className="an-search" role="search" onSubmit={submitSearch}>
            <Search size={18} strokeWidth={1.7} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search products"
              placeholder="Search Jayam"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </form>
        )}

        <p className="an-ribbon">
          <Leaf size={14} strokeWidth={2} aria-hidden="true" />
          <span>Free U.S. shipping on orders $49 and above.</span> <Link to="/shop">Shop the collection ›</Link>
        </p>
      </header>

      {menuOpen && (
        <div className="an-sheet">
          <ul>
            {LINKS.map(({ label, to }) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
            <li className="an-sheet-account">
              <Link to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'}>{user ? (user.role === 'admin' ? 'Store dashboard' : 'Your account') : 'Sign in'}</Link>
            </li>
          </ul>
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
