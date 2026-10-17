'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useCart } from './CartProvider';
import { useNavigate } from 'react-router-dom';
import { FREE_SHIPPING_THRESHOLD, formatPrice, shippingFor } from '../../lib/store';
export default function CartDrawer({
  isOpen,
  onClose
}) {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const {
    cart: cartItems,
    updateQuantity,
    cartTotal
  } = useCart();
  const navigate = useNavigate();
  const shipping = shippingFor(cartTotal);
  const awayFromFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;
  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;
    if (isOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.4
      });
      gsap.to(drawerRef.current, {
        x: '0%',
        duration: 0.6,
        ease: 'expo.out'
      });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.4
      });
      gsap.to(drawerRef.current, {
        x: '100%',
        duration: 0.5,
        ease: 'expo.in'
      });
      document.body.style.overflow = '';
    }
  }, [isOpen]);
  return <>
      {/* Overlay */}
      <div ref={overlayRef} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] opacity-0 pointer-events-none" />
      
      {/* Drawer */}
      <div ref={drawerRef} className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-brand-pearl z-[160] translate-x-full shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-8 border-b border-gray-200">
          <h2 className="text-sm uppercase tracking-widest font-medium">Your bag ({cartItems.length})</h2>
          <button onClick={onClose} className="text-sm uppercase tracking-widest hover:text-brand-green-500 transition-colors">
            Close
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
          {cartItems.map(item => <div key={item.id} className="flex gap-5 border-b border-gray-200 pb-6">
              <div className="w-20 h-24 relative bg-[#e4e7dc] overflow-hidden shrink-0 grid place-items-center">
                {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <img src="/jayam-logo.png" alt="" className="w-10 mix-blend-multiply" />}
              </div>
              <div className="flex flex-col justify-between py-2 flex-1">
                <div>
                  <h3 className="font-serif text-lg leading-tight mb-2">{item.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id.toString(), item.quantity - 1)} className="text-lg">−</button>
                  <span className="text-sm font-mono">{item.quantity}</span>
                  <button aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id.toString(), item.quantity + 1)} className="text-lg">+</button>
                  <button aria-label={`Remove ${item.name}`} onClick={() => updateQuantity(item.id.toString(), 0)} className="ml-auto text-[9px] uppercase tracking-widest text-gray-500 underline">Remove</button>
                </div>
              </div>
            </div>)}
          {cartItems.length === 0 && <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <p className="font-serif text-3xl">Your bag is empty.</p>
              <p className="text-sm text-gray-600 max-w-[260px]">Simple, plant-based essentials — free U.S. shipping on orders ${FREE_SHIPPING_THRESHOLD}+.</p>
              <button type="button" onClick={() => {
            onClose();
            navigate('/shop');
          }} className="mt-2 border border-brand-forest-700 px-6 py-3 text-xs uppercase tracking-widest hover:bg-brand-forest-700 hover:text-white transition-colors">
                Shop the collection
              </button>
            </div>}
        </div>
        
        <div className="p-8 border-t border-gray-200 bg-white" hidden={cartItems.length === 0}>
          {cartItems.length > 0 && <div className="mb-5">
              <p className="mb-2 text-xs text-gray-600">
                {awayFromFreeShipping > 0 ? <>You’re <strong>{formatPrice(awayFromFreeShipping)}</strong> away from free U.S. shipping.</> : 'Your order ships free within the U.S.'}
              </p>
              <div className="h-1 w-full bg-gray-200" role="progressbar" aria-label="Progress to free shipping" aria-valuemin={0} aria-valuemax={FREE_SHIPPING_THRESHOLD} aria-valuenow={Math.min(cartTotal, FREE_SHIPPING_THRESHOLD)}>
                <div className="h-full bg-brand-forest-700 transition-[width] duration-500" style={{ width: `${Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
              </div>
            </div>}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium uppercase tracking-widest">Subtotal</span>
            <span className="font-mono text-lg">{formatPrice(cartTotal)}</span>
          </div>
          {cartItems.length > 0 && <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
              <span>Shipping</span>
              <span className="font-mono">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>}
          <button disabled={cartItems.length === 0} onClick={() => {
          onClose();
          navigate('/checkout');
        }} className="w-full bg-brand-forest-700 text-white py-5 text-xs uppercase tracking-widest font-medium hover:bg-brand-forest-900 transition-colors disabled:cursor-not-allowed disabled:opacity-40">
            Checkout
          </button>
        </div>
      </div>
    </>;
}