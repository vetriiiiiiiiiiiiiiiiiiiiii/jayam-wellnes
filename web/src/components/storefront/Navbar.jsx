import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import CartDrawer from './CartDrawer';
import { useCart } from './CartProvider';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const openCart = () => setCartOpen(true);
    window.addEventListener('jayam:cart-open', openCart);
    return () => window.removeEventListener('jayam:cart-open', openCart);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <nav className={`fixed top-0 z-[100] w-full border-b transition-colors duration-300 ${isScrolled || location.pathname !== '/' ? 'border-[#e3dfd4] bg-[#f6f3ec] text-brand-dark' : 'border-transparent bg-[#f6f3ec] text-brand-dark'}`}>
        <div className="jayam-topline"><span>Free U.S. shipping on orders $49+</span></div>
        <div className="jayam-nav-inner">
          <Link to="/" aria-label="Jayam home" className="jayam-wordmark">
            <img src="/jayam-logo.png" alt="" />
            <span>JAYAM<small>WELLNESS</small></span>
          </Link>

          <form className="jayam-nav-search" role="search" onSubmit={submitSearch}>
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search products"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button type="submit" aria-label="Submit product search"><span aria-hidden="true">↗</span></button>
          </form>

          <div className="jayam-nav-right">
            <Link to="/shop" className="jayam-nav-products">Our Products</Link>
            <Link to="/our-story" className="jayam-nav-story">Our Story</Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="jayam-nav-bag"
              aria-label={`Open cart, ${cartCount} items`}
            >
              <span>Bag</span><span className="jayam-bag-count">{cartCount.toString().padStart(2, '0')}</span>
            </button>
          </div>
        </div>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
