'use client';

import { useState } from 'react';
import { useCart } from './CartProvider';
export default function ProductActions({
  product,
  selectedVariant,
  onVariantSelect
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.stock < quantity) return;
    setIsAdding(true);
    addToCart({
      id: product.id,
      productId: product.id,
      variantSku: selectedVariant?.sku,
      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
      quantity,
      image: product.images?.[0]?.url,
      ...(selectedVariant && { id: `${product.id}:${selectedVariant.sku || selectedVariant.name}` }),
    });
    setTimeout(() => {
      setIsAdding(false);
      window.dispatchEvent(new Event('jayam:cart-open'));
    }, 500);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Micro-interaction Size Selector */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-4 text-brand-forest-700">Choose an option</div>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((v) => (
              <button 
                key={v.sku || v.name} 
                onClick={() => onVariantSelect(v)} 
                disabled={v.stock <= 0}
                className={`relative rounded-full border px-5 py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${selectedVariant?.name === v.name ? 'border-brand-forest-700 bg-brand-forest-700 text-white' : 'border-gray-300 bg-transparent text-brand-dark hover:border-brand-forest-700'}`}
              >
                <span className="relative z-10">{v.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Animated Add to Cart */}
      <div className="pt-6 border-t border-gray-200">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-forest-700">Quantity</span>
          <div className="flex items-center gap-5 rounded-full border border-[#cdd6c2] px-4 py-2">
            <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
            <span aria-live="polite" className="min-w-4 text-center text-sm">{quantity}</span>
            <button type="button" aria-label="Increase quantity" disabled={selectedVariant && quantity >= selectedVariant.stock} onClick={() => setQuantity((value) => value + 1)}>+</button>
          </div>
        </div>
          <button onClick={handleAddToCart} disabled={isAdding || (selectedVariant && selectedVariant.stock <= 0)} className={`w-full relative overflow-hidden rounded-full py-4 text-sm font-semibold transition-colors ${isAdding ? 'bg-brand-green-500 text-white cursor-wait' : (selectedVariant && selectedVariant.stock <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand-forest-700 text-white hover:bg-brand-forest-900')}`}>
            <span className={`inline-block transition-transform duration-500 ${isAdding ? '-translate-y-16' : 'translate-y-0'}`}>
              {selectedVariant && selectedVariant.stock <= 0 ? 'Out of stock' : 'Add to bag'}
            </span>
            <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${isAdding ? 'translate-y-0' : 'translate-y-16'}`}>
              Added to bag
            </span>
          </button>
      </div>
    </div>
  );
}