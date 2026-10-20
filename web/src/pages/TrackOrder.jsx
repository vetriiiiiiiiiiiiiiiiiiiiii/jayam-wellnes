import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import OrderStatus from '../components/storefront/OrderStatus';
import PageHead from '../components/storefront/PageHead';
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
    <main className="pg to">
      <PageHead
        eyebrow="Order status"
        title="Track your"
        accent="order."
        sub="Enter the order number from your confirmation email and the email address you used at checkout."
      />

      <form onSubmit={handleSubmit} className="pg-tile to-form">
        <div className="pg-row">
          <label className="pg-field">Order number
            <input type="text" name="orderNumber" placeholder="ORD-XXXXXXXX" required defaultValue={params.get('order') || ''} autoCapitalize="characters" />
          </label>
          <label className="pg-field">Email address
            <input type="email" name="email" autoComplete="email" required />
          </label>
        </div>
        {errorMessage && <p className="pg-error" role="alert">{errorMessage}</p>}
        <button className="ap-pill ap-pill--block" type="submit" disabled={loading}>
          {loading ? 'Looking up…' : 'Find my order'}
        </button>
      </form>

      {order && <OrderStatus order={order} />}

      <p className="pg-note to-help">
        Need help? <Link to="/contact?category=ORDER_SUPPORT">Contact us</Link> and we’ll reply within 1 business day.
      </p>
    </main>
  );
}
