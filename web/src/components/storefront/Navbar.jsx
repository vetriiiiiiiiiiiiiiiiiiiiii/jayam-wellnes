'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import MagneticButton from './MagneticButton';
import CartDrawer from './CartDrawer';
import { useCart } from './CartProvider';
import { useApp } from '../../context/Appcontext';
import { BACKEND_URL, logout } from '../../services/api';
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const {
    cartCount
  } = useCart();
  const { user, setUser, setOrders, setCart } = useApp();

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const menuLinksRef = useRef([]);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menu Animation
  useEffect(() => {
    if (!menuRef.current) return;
    if (menuOpen) {
      gsap.to(menuRef.current, {
        yPercent: 100,
        duration: 0.8,
        ease: 'expo.inOut'
      });
      gsap.fromTo(menuLinksRef.current, {
        y: 50,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.4,
        ease: 'power3.out'
      });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(menuRef.current, {
        yPercent: 0,
        duration: 0.8,
        ease: 'expo.inOut'
      });
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  // Search Animation
  useEffect(() => {
    if (!searchRef.current) return;
    if (searchOpen) {
      gsap.to(searchRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.4
      });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(searchRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.4
      });
      if (!menuOpen) document.body.style.overflow = '';
    }
  }, [searchOpen, menuOpen]);
  const isLightHeader = !isHome || isScrolled || menuOpen || searchOpen;

  return <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isLightHeader ? 'bg-white/95 backdrop-blur-xl text-brand-dark border-b border-brand-green-100/60 shadow-xs' : 'bg-transparent text-white'}`}>
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center h-20 md:h-24">
          <div className="flex-1 flex items-center gap-6 md:gap-8">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity bg-white/90 rounded-xl px-2.5 py-1.5 shadow-md border border-brand-green-100/50 backdrop-blur-md" onClick={() => setMenuOpen(false)}>
              <img src="/miracletree-logo.jpeg" alt="Miracle Tree" className="h-9 w-9 rounded-lg object-cover" />
              <span className="font-serif font-bold text-lg md:text-xl tracking-tight text-brand-forest-700 hidden sm:inline-block">Miracle Tree</span>
            </Link>
            
            <MagneticButton>
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-xs uppercase tracking-[0.2em] font-semibold hover:opacity-60 transition-opacity">
                {menuOpen ? 'Close' : 'Menu'}
              </button>
            </MagneticButton>
            <MagneticButton>
              <button onClick={() => setSearchOpen(true)} className="text-xs uppercase tracking-[0.2em] font-semibold hidden md:block hover:opacity-60 transition-opacity">
                Search
              </button>
            </MagneticButton>
          </div>
          
          <div className="flex-1 flex justify-end gap-6 md:gap-8 items-center">
            {user && (user.role === 'admin' || user.role === 'SUPER_ADMIN') && (
              <MagneticButton>
                <Link to="/admin" className="text-xs uppercase tracking-[0.2em] font-bold text-brand-forest-700 hidden md:block hover:opacity-60 transition-opacity">
                  Admin Panel
                </Link>
              </MagneticButton>
            )}
            {user ? (
              <div className="relative hidden md:block group">
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)} 
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none"
                >
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `${BACKEND_URL}${user.profilePicture.startsWith('/') ? '' : '/'}${user.profilePicture}`} 
                      alt={user.fullname || user.name} 
                      className="w-8 h-8 rounded-full border border-brand-green-100 object-cover shadow-sm" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-forest-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {(user.fullname || user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs uppercase tracking-[0.15em] font-semibold flex items-center gap-1">
                    {user.fullname?.split(' ')[0] || user.name?.split(' ')[0]}
                    <svg className={`w-3 h-3 transition-transform duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute top-full mt-4 right-0 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 py-3 flex flex-col z-[120] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-5 py-2 border-b border-gray-50 mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Signed in as</p>
                      <p className="text-sm font-medium text-brand-dark truncate">{user.email}</p>
                    </div>
                    {(user.role === 'admin' || user.role === 'SUPER_ADMIN') && (
                      <Link 
                        to="/admin" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-5 py-2 text-sm text-brand-forest-700 hover:bg-brand-pearl hover:text-brand-gold transition-colors font-medium flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Admin Panel
                      </Link>
                    )}
                    <Link 
                      to="/account" 
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-5 py-2 text-sm text-gray-700 hover:bg-brand-pearl transition-colors"
                    >
                      My Account
                    </Link>
                    <Link 
                      to="/account" 
                      onClick={() => setUserDropdownOpen(false)}
                      className="px-5 py-2 text-sm text-gray-700 hover:bg-brand-pearl transition-colors"
                    >
                      Order History
                    </Link>
                    <button 
                      onClick={async () => {
                        await logout();
                        setUser(null);
                        setCart(null);
                        setOrders([]);
                        navigate('/');
                        setUserDropdownOpen(false);
                      }}
                      className="px-5 py-2 text-sm text-red-500 hover:bg-red-50 text-left transition-colors mt-2 border-t border-gray-50 pt-3"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <MagneticButton>
                <Link to="/account" className="text-xs uppercase tracking-[0.2em] font-semibold hidden md:block hover:opacity-60 transition-opacity">
                  Account
                </Link>
              </MagneticButton>
            )}
            <MagneticButton>
              <button onClick={() => setCartOpen(true)} className="text-xs uppercase tracking-[0.2em] font-semibold hover:opacity-60 transition-opacity">
                Cart ({cartCount})
              </button>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mega Menu */}
      <div ref={menuRef} className="fixed top-0 left-0 w-full h-screen bg-brand-pearl z-[90] -translate-y-full flex flex-col justify-center px-12 md:px-32">
        <div className="flex flex-col gap-4 max-w-4xl">
          {['Shop', 'Collections', 'Our Story', 'Journal', 'Contact'].map((item, i) => <div key={item} className="overflow-hidden py-2">
              <Link to={`/${item.toLowerCase().replace(' ', '-')}`} ref={el => {
            menuLinksRef.current[i] = el;
          }} onClick={() => setMenuOpen(false)} className="text-[8vw] md:text-[6vw] font-serif leading-none tracking-tighter text-black hover:text-brand-green-500 transition-colors inline-block">
                {item}
              </Link>
            </div>)}
        </div>
      </div>

      {/* Fullscreen Search */}
      <div ref={searchRef} className="fixed inset-0 bg-brand-pearl/95 backdrop-blur-2xl z-[110] opacity-0 pointer-events-none flex flex-col items-center justify-center px-6">
        <button onClick={() => setSearchOpen(false)} className="absolute top-12 right-12 text-[10px] uppercase tracking-[0.2em] font-medium text-brand-forest-700 hover:text-brand-gold transition-colors flex items-center gap-2 group">
          <span>Close</span>
          <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
          }
        }} className="w-full max-w-4xl relative group">
          <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-brand-forest-700/30 group-focus-within:text-brand-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="What are you looking for?" autoFocus={searchOpen} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-3xl md:text-5xl font-sans font-light text-brand-forest-700 bg-transparent border-b border-brand-forest-700/20 pb-4 pl-16 outline-none placeholder:text-brand-forest-700/30 focus:border-brand-gold transition-colors" />
          <span className="absolute bottom-[-30px] left-16 text-xs font-sans text-brand-forest-700/40 uppercase tracking-widest hidden md:block">Press Enter to search</span>
        </form>
      </div>
      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>;
}