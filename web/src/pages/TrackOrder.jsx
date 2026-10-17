import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import OrderStatus from '../components/storefront/OrderStatus';
import { trackOrder } from '../services/api';

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [order, setOrder] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setErrorMessage('');
    const result = await trackOrder(String(form.get('orderNumber')).trim(), String(form.get('email')).trim());
    setLoading(false);
    if (result.success) {
      setOrder(result.order);
    } else {
      setOrder(null);
      setErrorMessage(result.message);
    }
  };

  return (
    <main className="jayam-checkout jayam-order-page">
      <p className="jayam-eyebrow">Order status</p>
      <h1>Track your <em>order.</em></h1>
      <p>Enter the order number from your confirmation email and the email address you used at checkout.</p>

      <form onSubmit={handleSubmit} className="jayam-checkout-form jayam-track-form">
        <div className="jayam-checkout-fields">
          <label>Order number
            <input type="text" name="orderNumber" placeholder="ORD-XXXXXXXX" required defaultValue={params.get('order') || ''} autoCapitalize="characters" />
          </label>
          <label>Email address
            <input type="email" name="email" autoComplete="email" required />
          </label>
        </div>
        {errorMessage && <p className="jayam-checkout-error" role="alert">{errorMessage}</p>}
        <button className="jayam-place-order" type="submit" disabled={loading}>
          {loading ? 'Looking up…' : 'Find my order'}
        </button>
      </form>

      {order && <OrderStatus order={order} />}

      <p className="jayam-checkout-note">
        Need help? <Link to="/contact?category=ORDER_SUPPORT">Contact us</Link> and we’ll reply within 1 business day.
      </p>
    </main>
  );
}
