import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout components
import Navbar from './components/storefront/Navbar';
import Footer from './components/storefront/Footer';
import CustomCursor from './components/storefront/CustomCursor';
import SmoothScroll from './components/storefront/SmoothScroll';
import ScrollProgress from './components/storefront/ScrollProgress';
import { CartProvider } from './components/storefront/CartProvider';

// Pages — Storefront
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Collections from './pages/Collections';
import OurStory from './pages/OurStory';
import Journal from './pages/Journal';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Account from './pages/Account';

// Pages — Auth
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <CartProvider>
      <SmoothScroll>
        <Router>
          <CustomCursor />
          <ScrollProgress />
          <Navbar />
          <main className="flex-grow flex flex-col">
            <Routes>
              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Storefront */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/products/:slug" element={<Product />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/account" element={<Account />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </SmoothScroll>
    </CartProvider>
  );
}

export default App;
