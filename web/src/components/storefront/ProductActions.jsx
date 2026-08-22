'use client';

import { useState } from 'react';
import MagneticButton from './MagneticButton';
import { useCart } from './CartProvider';

export default function ProductActions({
  product,
  selectedVariant,
  onVariantSelect
}) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart({
      id: product.id,
      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      image: product.images?.[0]?.url || "https://images.unsplash.com/photo-1615396899839-c99c14188f00?w=800"
    });
    setTimeout(() => {
      setIsAdding(false);
      // Trigger cart drawer open logic here typically
    }, 500);
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Micro-interaction Size Selector */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] mb-4 text-gray-500">Select Variant</div>
          <div className="flex flex-wrap gap-4">
            {product.variants.map((v) => (
              <button 
                key={v.sku || v.name} 
                onClick={() => onVariantSelect(v)} 
                className={`relative px-6 py-3 rounded-full font-mono text-sm transition-all duration-500 overflow-hidden ${selectedVariant?.name === v.name ? 'text-white shadow-xl scale-105' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}
              >
                <span className="relative z-10">{v.name}</span>
                {/* Apple-style morphing background pill */}
                <div className={`absolute inset-0 bg-black transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${selectedVariant?.name === v.name ? 'translate-y-0 rounded-full' : 'translate-y-full rounded-none'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Animated Add to Cart */}
      <div className="pt-8 border-t border-gray-200">
        <MagneticButton>
          <button onClick={handleAddToCart} disabled={isAdding || (selectedVariant && selectedVariant.stock <= 0)} className={`w-full relative py-6 rounded-full font-medium uppercase tracking-widest text-sm transition-all duration-700 overflow-hidden ${isAdding ? 'bg-brand-green-500 text-white cursor-wait scale-[0.98]' : (selectedVariant && selectedVariant.stock <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-brand-green-700')}`}>
            <span className={`inline-block transition-transform duration-500 ${isAdding ? '-translate-y-16' : 'translate-y-0'}`}>
              {selectedVariant && selectedVariant.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
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