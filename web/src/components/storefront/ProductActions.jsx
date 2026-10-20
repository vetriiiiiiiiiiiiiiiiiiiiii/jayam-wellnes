import { useState } from 'react';
import { useCart } from './CartProvider';

// Options, quantity and "Add to bag" for the product page
export default function ProductActions({ product, selectedVariant, onVariantSelect }) {
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const soldOut = selectedVariant && selectedVariant.stock <= 0;

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.stock < quantity) return;
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
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      window.dispatchEvent(new Event('jayam:cart-open'));
    }, 450);
  };

  return (
    <div className="pa">
      {product.variants?.length > 0 && (
        <fieldset className="pa-options">
          <legend>Choose an option</legend>
          <div className="pg-chips">
            {product.variants.map((variant) => (
              <button
                key={variant.sku || variant.name}
                type="button"
                onClick={() => onVariantSelect(variant)}
                disabled={variant.stock <= 0}
                className={selectedVariant?.name === variant.name ? 'is-active' : ''}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="pa-row">
        <div className="pa-qty" aria-label="Quantity">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" aria-label="Increase quantity" disabled={selectedVariant && quantity >= selectedVariant.stock} onClick={() => setQuantity((value) => value + 1)}>+</button>
        </div>
        <button type="button" className="ap-pill pa-add" onClick={handleAddToCart} disabled={added || soldOut}>
          {soldOut ? 'Out of stock' : added ? 'Added ✓' : 'Add to bag'}
        </button>
      </div>
    </div>
  );
}
