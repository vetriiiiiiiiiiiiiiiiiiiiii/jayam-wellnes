'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import MagneticButton from './MagneticButton';
import CartDrawer from './CartDrawer';
import { useCart } from './CartProvider';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cartCount } = useCart();
  
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);

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
      gsap.to(menuRef.current, { yPercent: 100, duration: 0.8, ease: 'expo.inOut' });
      gsap.fromTo(menuLinksRef.current, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.4, ease: 'power3.out' }
      );
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(menuRef.current, { yPercent: 0, duration: 0.8, ease: 'expo.inOut' });
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  // Search Animation
  useEffect(() => {
    if (!searchRef.current) return;
    if (searchOpen) {
      gsap.to(searchRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(searchRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4 });
      if (!menuOpen) document.body.style.overflow = '';
    }
  }, [searchOpen, menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[100] transition-colors duration-500 ${
          isScrolled || menuOpen || searchOpen ? 'bg-white/90 backdrop-blur-xl text-black border-b border-gray-100' : 'bg-transparent text-white'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center h-24">
          <div className="flex-1 flex items-center gap-8">
            <Link href="/" className="hover:opacity-80 transition-opacity bg-white/95 rounded-xl p-1.5 shadow-lg backdrop-blur-md" onClick={() => setMenuOpen(false)}>
              <img src="/miracletree-logo.jpeg" alt="Miracle Tree" className="h-10 w-auto object-contain" />
            </Link>
            
            <MagneticButton>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="text-xs uppercase tracking-[0.2em] font-medium hover:opacity-60 transition-opacity"
              >
                {menuOpen ? 'Close' : 'Menu'}
              </button>
            </MagneticButton>
            <MagneticButton>
              <button 
                onClick={() => setSearchOpen(true)}
                className="text-xs uppercase tracking-[0.2em] font-medium hidden md:block hover:opacity-60 transition-opacity"
              >
                Search
              </button>
            </MagneticButton>
          </div>
          
          <div className="flex-1 flex justify-end gap-8">
            <MagneticButton>
              <Link href="/account" className="text-xs uppercase tracking-[0.2em] font-medium hidden md:block hover:opacity-60 transition-opacity">
                Account
              </Link>
            </MagneticButton>
            <MagneticButton>
              <button 
                onClick={() => setCartOpen(true)}
                className="text-xs uppercase tracking-[0.2em] font-medium hover:opacity-60 transition-opacity"
              >
                Cart ({cartCount})
              </button>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mega Menu */}
      <div 
        ref={menuRef} 
        className="fixed top-0 left-0 w-full h-screen bg-brand-pearl z-[90] -translate-y-full flex flex-col justify-center px-12 md:px-32"
      >
        <div className="flex flex-col gap-4 max-w-4xl">
          {['Shop', 'Collections', 'Our Story', 'Journal', 'Contact'].map((item, i) => (
            <div key={item} className="overflow-hidden py-2">
              <Link 
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                ref={el => { menuLinksRef.current[i] = el; }}
                onClick={() => setMenuOpen(false)}
                className="text-[8vw] md:text-[6vw] font-serif leading-none tracking-tighter text-black hover:text-brand-green-500 transition-colors inline-block"
              >
                {item}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Search */}
      <div 
        ref={searchRef}
        className="fixed inset-0 bg-brand-pearl/95 backdrop-blur-2xl z-[110] opacity-0 pointer-events-none flex flex-col items-center justify-center px-6"
      >
        <button 
          onClick={() => setSearchOpen(false)}
          className="absolute top-12 right-12 text-[10px] uppercase tracking-[0.2em] font-medium text-brand-forest-700 hover:text-brand-gold transition-colors flex items-center gap-2 group"
        >
          <span>Close</span>
          <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="w-full max-w-4xl relative group">
          <svg className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-brand-forest-700/30 group-focus-within:text-brand-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="What are you looking for?" 
            autoFocus={searchOpen}
            className="w-full text-3xl md:text-5xl font-sans font-light text-brand-forest-700 bg-transparent border-b border-brand-forest-700/20 pb-4 pl-16 outline-none placeholder:text-brand-forest-700/30 focus:border-brand-gold transition-colors"
          />
          <span className="absolute bottom-[-30px] left-16 text-xs font-sans text-brand-forest-700/40 uppercase tracking-widest hidden md:block">Press Enter to search</span>
        </div>
      </div>
      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
