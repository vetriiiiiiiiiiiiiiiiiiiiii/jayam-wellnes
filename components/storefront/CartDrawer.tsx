'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

import { useCart } from './CartProvider';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const { cart: cartItems, updateQuantity, cartTotal } = useCart();

  useEffect(() => {
    if (!drawerRef.current || !overlayRef.current) return;

    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
      gsap.to(drawerRef.current, { x: '0%', duration: 0.6, ease: 'expo.out' });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4 });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.5, ease: 'expo.in' });
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] opacity-0 pointer-events-none"
      />
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-brand-pearl z-[160] translate-x-full shadow-2xl flex flex-col"
      >
        <div className="flex justify-between items-center p-8 border-b border-gray-200">
          <h2 className="text-sm uppercase tracking-widest font-medium">Your Cart ({cartItems.length})</h2>
          <button onClick={onClose} className="text-sm uppercase tracking-widest hover:text-brand-green-500 transition-colors">
            Close
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-6">
              <div className="w-24 h-32 relative bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-between py-2 flex-1">
                <div>
                  <h3 className="font-serif text-lg leading-tight mb-2">{item.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => updateQuantity(item.id.toString(), item.quantity - 1)} className="text-lg">-</button>
                  <span className="text-sm font-mono">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id.toString(), item.quantity + 1)} className="text-lg">+</button>
                </div>
              </div>
            </div>
          ))}
          {cartItems.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-sm uppercase tracking-widest text-gray-500">
              Your cart is empty
            </div>
          )}
        </div>
        
        <div className="p-8 border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium uppercase tracking-widest">Subtotal</span>
            <span className="font-mono text-lg">₹{cartTotal.toFixed(2)}</span>
          </div>
          <button onClick={() => { onClose(); window.location.href = '/checkout'; }} className="w-full bg-black text-white py-5 text-sm uppercase tracking-widest font-medium hover:bg-brand-green-700 transition-colors">
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}
