import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCart } from '../components/storefront/CartProvider';
import OrderStatus from '../components/storefront/OrderStatus';
import PageHead from '../components/storefront/PageHead';
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
    return <main className="pg co-done"><p className="pg-note">Confirming your payment…</p></main>;
  }

  const failed = state.success === false || (state.paymentStatus && !['succeeded', 'processing'].includes(state.paymentStatus));
  if (failed) {
    return (
      <main className="pg co-done">
        <PageHead
          eyebrow="Payment not completed"
          title="Something went"
          accent="wrong."
          sub={state.message || 'Your payment was not completed, so you have not been charged. Please try again.'}
        >
          <div className="ap-ctas"><Link to="/checkout" className="ap-pill">Back to checkout</Link></div>
        </PageHead>
      </main>
    );
  }

  return (
    <main className="pg co-done">
      <span className="co-done-mark" aria-hidden="true"><Check size={30} strokeWidth={2.2} /></span>
      <PageHead
        eyebrow="Thank you"
        title="Your order is"
        accent="confirmed."
        sub={state.paymentStatus === 'processing'
          ? 'Your payment is processing. We’ll email you as soon as it’s confirmed.'
          : `We’ve emailed your confirmation${state.order ? ` to ${state.order.email}` : ''}. We’ll send tracking details when your order ships.`}
      >
        <div className="ap-ctas">
          <Link to={`/track-order${orderNumber ? `?order=${encodeURIComponent(orderNumber)}` : ''}`} className="ap-pill">Track your order</Link>
          <Link to="/shop" className="ap-link">Continue shopping ›</Link>
        </div>
      </PageHead>
      {state.order && <OrderStatus order={state.order} />}
    </main>
  );
}
