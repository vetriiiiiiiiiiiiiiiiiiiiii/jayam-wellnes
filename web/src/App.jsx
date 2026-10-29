import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import Navbar from './components/storefront/Navbar';
import Footer from './components/storefront/Footer';
import { CartProvider } from './components/storefront/CartProvider';
import { AuthProvider } from './lib/auth';
import Home from './pages/Home';

// Everything except the home page loads on demand, so the first visit downloads only
// what it shows; the admin panel is a separate bundle that shoppers never fetch.
const Shop = lazy(() => import('./pages/Shop'));
const Product = lazy(() => import('./pages/Product'));
const OurStory = lazy(() => import('./pages/OurStory'));
const Contact = lazy(() => import('./pages/Contact'));
const Faq = lazy(() => import('./pages/Faq'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Legal = lazy(() => import('./pages/Legal'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Account = lazy(() => import('./pages/Account'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductEditor = lazy(() => import('./pages/admin/AdminProductEditor'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminEnquiries = lazy(() => import('./pages/admin/AdminEnquiries'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent'));

function PageFallback() {
  return <div className="route-loading" aria-busy="true" />;
}

// Each new page starts at the top (anchor links keep their own scrolling)
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function StorefrontLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route
              path="/admin"
              element={(
                <Suspense fallback={<PageFallback />}>
                  <AdminLayout />
                </Suspense>
              )}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/:id" element={<AdminProductEditor />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/products/:slug" element={<Product />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/privacy" element={<Legal page="privacy" />} />
              <Route path="/terms" element={<Legal page="terms" />} />
              <Route path="/shipping-returns" element={<Legal page="shipping" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/account" element={<Account />} />
              <Route path="/collections" element={<Navigate to="/shop" replace />} />
              <Route path="/journal" element={<Navigate to="/our-story" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
