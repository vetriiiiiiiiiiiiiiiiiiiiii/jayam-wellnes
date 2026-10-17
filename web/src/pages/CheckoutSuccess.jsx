import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../components/storefront/CartProvider';
import OrderStatus from '../components/storefront/OrderStatus';
import { confirmOrderPayment } from '../services/api';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderNumber = params.get('order');
  const paymentIntentId = params.get('payment_intent');
  const { clearCart } = useCart();
  const [state, setState] = useState({ loading: Boolean(orderNumber && paymentIntentId) });

  useEffect(() => {
    if (!orderNumber || !paymentIntentId) return;
    let active = true;
    confirmOrderPayment(orderNumber, paymentIntentId).then((result) => {
      if (!active) return;
      if (result.success && ['succeeded', 'processing'].includes(result.paymentStatus)) {
        clearCart();
        localStorage.removeItem('jayam_cart');
      }
      setState({ loading: false, ...result });
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber, paymentIntentId]);

  if (state.loading) {
    return <main className="jayam-checkout jayam-order-page"><p className="jayam-eyebrow">Confirming your payment…</p></main>;
  }

  const failed = state.success === false || (state.paymentStatus && !['succeeded', 'processing'].includes(state.paymentStatus));
  if (failed) {
    return (
      <main className="jayam-checkout jayam-order-page">
        <p className="jayam-eyebrow">Payment not completed</p>
        <h1>Something went <em>wrong.</em></h1>
        <p>{state.message || 'Your payment was not completed, so you have not been charged. Please try again.'}</p>
        <Link to="/checkout" className="jayam-primary-link">Back to checkout <span aria-hidden="true">↗</span></Link>
      </main>
    );
  }

  return (
    <main className="jayam-checkout jayam-order-page">
      <p className="jayam-eyebrow">Thank you</p>
      <h1>Your order is <em>confirmed.</em></h1>
      <p>
        {state.paymentStatus === 'processing'
          ? 'Your payment is processing. We’ll email you as soon as it’s confirmed.'
          : `We’ve emailed your confirmation${state.order ? ` to ${state.order.email}` : ''}. We’ll send tracking details when your order ships.`}
      </p>
      {state.order && <OrderStatus order={state.order} />}
      <div className="jayam-order-actions">
        <Link to={`/track-order${orderNumber ? `?order=${encodeURIComponent(orderNumber)}` : ''}`} className="jayam-primary-link">Track your order <span aria-hidden="true">↗</span></Link>
        <Link to="/shop" className="jayam-back-to-shop">← Continue shopping</Link>
      </div>
    </main>
  );
}
