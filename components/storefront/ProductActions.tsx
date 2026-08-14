'use client';

import { useState } from 'react';
import MagneticButton from './MagneticButton';

export default function ProductActions({ price }: { price: number }) {
  const [size, setSize] = useState('100g');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      // Here you would typically trigger the cart drawer open
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Micro-interaction Size Selector */}
      <div>
        <div className="text-xs font-mono uppercase tracking-[0.2em] mb-4 text-gray-500">Select Size</div>
        <div className="flex gap-4">
          {['50g', '100g', '250g'].map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`relative px-8 py-4 rounded-full font-mono text-sm transition-all duration-500 overflow-hidden ${
                size === s 
                  ? 'text-white shadow-xl scale-105' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className="relative z-10">{s}</span>
              {/* Apple-style morphing background pill */}
              <div 
                className={`absolute inset-0 bg-black transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                  size === s ? 'translate-y-0 rounded-full' : 'translate-y-full rounded-none'
                }`} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Animated Add to Cart */}
      <div className="pt-8 border-t border-gray-200">
        <MagneticButton>
          <button 
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full relative py-6 rounded-full font-medium uppercase tracking-widest text-sm transition-all duration-700 overflow-hidden ${
              isAdding ? 'bg-brand-green-500 text-white cursor-wait scale-[0.98]' : 'bg-black text-white hover:bg-brand-green-700'
            }`}
          >
            <span className={`inline-block transition-transform duration-500 ${isAdding ? '-translate-y-16' : 'translate-y-0'}`}>
              Add to Cart
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${isAdding ? 'translate-y-0' : 'translate-y-16'}`}>
              Adding...
            </span>
          </button>
        </MagneticButton>
      </div>
    </div>
  );
}
