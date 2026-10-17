import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import Navbar from './components/storefront/Navbar';
import Footer from './components/storefront/Footer';
import { CartProvider } from './components/storefront/CartProvider';

// Pages — Storefront
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Collections from './pages/Collections';
import OurStory from './pages/OurStory';
import Journal from './pages/Journal';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import TrackOrder from './pages/TrackOrder';

// Pages — Auth
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminEnquiries from './pages/admin/AdminEnquiries';

import { AppProvider } from './context/Appcontext';

function App() {
  // Fade the crumpled-paper overlay as the visitor scrolls down the page
  useEffect(() => {
    let frame = 0;
    const updatePaper = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / 1400, 1);
        const easedProgress = progress * progress * (3 - 2 * progress);
        document.documentElement.style.setProperty(
          '--paper-wrinkle-opacity',
          `${0.32 * (1 - easedProgress)}`,
        );
      });
    };

    updatePaper();
    window.addEventListener('scroll', updatePaper, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updatePaper);
      document.documentElement.style.removeProperty('--paper-wrinkle-opacity');
    };
  }, []);

  return (
    <AppProvider authEnabled={false}>
      <CartProvider>
        <Router>
          <Navbar />
          <main className="flex-grow flex flex-col">
            <Routes>
                {/* Admin */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/enquiries" element={<AdminEnquiries />} />

                {/* Storefront */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/products/:slug" element={<Product />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/our-story" element={<OurStory />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/account" element={<Navigate to="/" replace />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </CartProvider>
    </AppProvider>
  );
}

export default App;
