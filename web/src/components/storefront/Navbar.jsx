import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import CartDrawer from './CartDrawer';
import { useCart } from './CartProvider';

const LINKS = [
  { label: 'Shop', to: '/shop' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Contact', to: '/contact' },
];

// Slim, quiet navigation in the style of apple.com: logo, centred links, search and bag.
export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

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
      <header className="an">
        <nav className="an-bar" aria-label="Main">
          <button type="button" className="an-icon an-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} strokeWidth={1.6} /> : <Menu size={20} strokeWidth={1.6} />}
          </button>

          <Link to="/" className="an-logo" aria-label="Jayam Wellness home">
            <span className="an-logo-mark"><img src="/jayam-logo.png" alt="" width="44" height="44" /></span>
            <span className="an-wordmark">
              <b>JAYAM</b>
              <small>Wellness</small>
            </span>
          </Link>

          <ul className="an-links">
            {LINKS.map(({ label, to }) => (
              <li key={to}><NavLink to={to}>{label}</NavLink></li>
            ))}
          </ul>

          <div className="an-actions">
            <button type="button" className="an-icon" aria-label="Search products" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}>
              <Search size={18} strokeWidth={1.7} />
            </button>
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
          Free U.S. shipping on orders $49 and above. <Link to="/shop">Shop the collection ›</Link>
        </p>
      </header>

      {menuOpen && (
        <div className="an-sheet">
          <ul>
            {LINKS.map(({ label, to }) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
