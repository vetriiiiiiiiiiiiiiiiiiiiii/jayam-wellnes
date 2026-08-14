'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add background when scrolled past 50px
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isScrolled ? 'bg-brand-pearl/80 backdrop-blur-md border-b border-black/5' : 'bg-transparent text-white'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Left Links */}
        <nav className="hidden md:flex gap-8">
          <Link href="/shop" className={`text-sm font-medium tracking-wide uppercase ${isScrolled ? 'text-brand-dark' : 'text-white/90 hover:text-white'} transition-colors`}>Shop</Link>
          <Link href="/our-story" className={`text-sm font-medium tracking-wide uppercase ${isScrolled ? 'text-brand-dark' : 'text-white/90 hover:text-white'} transition-colors`}>Our Story</Link>
        </nav>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <span className={`font-serif text-2xl tracking-tighter ${isScrolled ? 'text-brand-forest-700' : 'text-white'}`}>Miracle Tree</span>
        </Link>

        {/* Right Links */}
        <nav className="flex gap-6 items-center">
          <Link href="/login" className={`hidden md:block text-sm font-medium tracking-wide uppercase ${isScrolled ? 'text-brand-dark' : 'text-white/90 hover:text-white'} transition-colors`}>Account</Link>
          <button className={`text-sm font-medium tracking-wide uppercase flex items-center gap-2 ${isScrolled ? 'text-brand-dark' : 'text-white/90 hover:text-white'} transition-colors group`}>
            Cart <span className="bg-brand-forest-500 text-brand-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">0</span>
          </button>
        </nav>
      </div>
    </motion.header>
  );
}
