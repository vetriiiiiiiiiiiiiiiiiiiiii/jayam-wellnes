import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { formatPrice } from '../../lib/store';

// Slim buy bar in the manner of apple.com product pages: once the main
// "Add to bag" has scrolled away, the name, price and a Buy button stay in reach.
const SHOW_AFTER = 720;

export default function BuyBar({ product, selectedVariant }) {
  const [visible, setVisible] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    let ticking = false;
    const check = () => {
      ticking = false;
      setVisible(window.scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      setTimeout(check, 80);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const price = selectedVariant ? selectedVariant.price : product.price;
  const soldOut = selectedVariant && selectedVariant.stock <= 0;

  const buy = () => {
    addToCart({
      id: selectedVariant ? `${product.id}:${selectedVariant.sku || selectedVariant.name}` : product.id,
      productId: product.id,
      variantSku: selectedVariant?.sku,
      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
      price,
      quantity: 1,
      image: product.images?.[0]?.url,
    });
    window.dispatchEvent(new Event('jayam:cart-open'));
  };

  return (
    <div className={`ab${visible ? ' is-visible' : ''}`} aria-hidden={!visible}>
      <div className="ab-inner">
        <p className="ab-name">{product.name.replace(/^Organic\s+/i, '').split(' — ')[0]}</p>
        <p className="ab-price">{formatPrice(price)}</p>
        <button type="button" className="ap-pill ab-buy" onClick={buy} disabled={soldOut} tabIndex={visible ? 0 : -1}>
          {soldOut ? 'Sold out' : 'Buy'}
        </button>
      </div>
    </div>
  );
}
