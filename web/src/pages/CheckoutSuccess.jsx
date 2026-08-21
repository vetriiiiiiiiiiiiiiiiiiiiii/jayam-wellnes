import React from 'react';
import { Link } from 'react-router-dom';

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-brand-pearl flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl md:text-7xl font-serif text-brand-dark tracking-tighter mb-6">
        Thank <em className="text-brand-gold not-italic">You!</em>
      </h1>
      <p className="text-brand-dark/70 font-light max-w-md mb-10">
        Your order has been placed successfully. We'll send you a confirmation email shortly.
      </p>
      <Link to="/shop" className="px-8 py-4 bg-brand-dark text-white rounded-full font-medium tracking-wide hover:scale-105 transition-transform">
        Continue Shopping
      </Link>
    </div>
  );
}
