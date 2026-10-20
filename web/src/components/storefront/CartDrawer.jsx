import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCart } from './CartProvider';
import ItemThumb from './ItemThumb';
import { FREE_SHIPPING_THRESHOLD, formatPrice, shippingFor } from '../../lib/store';

// The bag slides in from the right: items as small packs, free-shipping progress, checkout.
export default function CartDrawer({ isOpen, onClose }) {
  const { cart: cartItems, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();
  const shipping = shippingFor(cartTotal);
  const awayFromFreeShipping = FREE_SHIPPING_THRESHOLD - cartTotal;

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      <div className={`cd-overlay${isOpen ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cd${isOpen ? ' is-open' : ''}`} aria-label="Your bag" aria-hidden={!isOpen} inert={!isOpen}>
        <header className="cd-head">
          <h2>Bag <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0) || ''}</span></h2>
          <button type="button" className="an-icon" onClick={onClose} aria-label="Close bag"><X size={20} strokeWidth={1.6} /></button>
        </header>

        {cartItems.length === 0 ? (
          <div className="cd-empty">
            <h3>Your bag is empty.</h3>
            <p>Simple, plant-based essentials — free U.S. shipping on orders ${FREE_SHIPPING_THRESHOLD}+.</p>
            <button type="button" className="ap-pill" onClick={() => go('/shop')}>Shop the collection</button>
          </div>
        ) : (
          <>
            <div className="cd-ship">
              <p>
                {awayFromFreeShipping > 0
                  ? <>You’re <b>{formatPrice(awayFromFreeShipping)}</b> away from free U.S. shipping.</>
                  : <>Your order ships <b>free</b> within the U.S.</>}
              </p>
              <div className="cd-bar" role="progressbar" aria-label="Progress to free shipping" aria-valuemin={0} aria-valuemax={FREE_SHIPPING_THRESHOLD} aria-valuenow={Math.min(cartTotal, FREE_SHIPPING_THRESHOLD)}>
                <span style={{ width: `${Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
              </div>
            </div>

            <ul className="cd-items">
              {cartItems.map((item) => (
                  <li key={item.id} className="cd-item">
                    <ItemThumb item={item} className="cd-thumb" />
                    <div className="cd-info">
                      <h3>{item.name.replace(/^Organic\s+/i, '').split(' — ')[0]}</h3>
                      <p>{formatPrice(item.price)}</p>
                      <div className="cd-controls">
                        <div className="pa-qty">
                          <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id.toString(), item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id.toString(), item.quantity + 1)}>+</button>
                        </div>
                        <button type="button" className="cd-remove" onClick={() => updateQuantity(item.id.toString(), 0)}>Remove</button>
                      </div>
                    </div>
                    <b className="cd-line-total">{formatPrice(item.price * item.quantity)}</b>
                  </li>
              ))}
            </ul>

            <footer className="cd-foot">
              <dl className="os-totals">
                <div><dt>Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div>
                <div><dt>Shipping</dt><dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
              </dl>
              <button type="button" className="ap-pill ap-pill--block" onClick={() => go('/checkout')}>Check out</button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
