import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useCart } from '../components/storefront/CartProvider';
import PageHead from '../components/storefront/PageHead';
import ItemThumb from '../components/storefront/ItemThumb';
import { createOrder } from '../services/api';
import { FREE_SHIPPING_THRESHOLD, US_STATES, formatPrice, shippingFor } from '../lib/store';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const stripeAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#2c6975',
    colorText: '#2c6975',
    colorBackground: '#ffffff',
    colorDanger: '#a33a2a',
    fontFamily: '-apple-system, BlinkMacSystemFont, Inter, Helvetica Neue, Arial, sans-serif',
    borderRadius: '12px',
  },
  rules: {
    '.Input': { border: '1px solid #cde0c9', boxShadow: 'none' },
    '.Tab': { border: '1px solid #cde0c9', boxShadow: 'none' },
  },
};

// Card, Apple Pay, Google Pay (and any other methods enabled in the Stripe Dashboard)
function PaymentStep({ order, total, details, onEdit }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePay = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setErrorMessage('');

    const successPath = `/checkout/success?order=${encodeURIComponent(order.orderNumber)}`;
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirect-based methods (e.g. PayPal) come back here
        return_url: `${window.location.origin}${successPath}`,
        payment_method_data: {
          billing_details: { name: details.name, email: details.email, phone: details.phone || undefined },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Your payment could not be completed. Please try again.');
      setPaying(false);
      return;
    }
    navigate(`${successPath}&payment_intent=${encodeURIComponent(paymentIntent.id)}`);
  };

  const address = details.address;
  return (
    <form onSubmit={handlePay} className="co-form">
      <section className="pg-tile co-step">
        <h2>Shipping to</h2>
        <div className="co-review">
          <p>
            {details.name} · {details.email}<br />
            {address.street}{address.street2 ? `, ${address.street2}` : ''}<br />
            {address.city}, {address.state} {address.zipCode}
          </p>
          <button type="button" className="ap-link" onClick={onEdit} disabled={paying}>Edit</button>
        </div>
      </section>
      <section className="pg-tile co-step">
        <h2>Payment</h2>
        <p className="pg-note">All payments are processed securely by Stripe in U.S. dollars.</p>
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: { billingDetails: { name: 'never', email: 'never', phone: 'never' } },
          }}
        />
      </section>
      {errorMessage && <p className="pg-error" role="alert">{errorMessage}</p>}
      <button className="ap-pill ap-pill--block" type="submit" disabled={!stripe || paying}>
        {paying ? 'Processing…' : `Pay ${formatPrice(total)}`}
      </button>
      <p className="pg-note">Order {order.orderNumber}</p>
    </form>
  );
}

export default function CheckoutPage() {
  const { cart, cartTotal, cartCount } = useCart();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [details, setDetails] = useState(null);
  const [startedOrder, setOrder] = useState(null);
  const shipping = shippingFor(cartTotal);
  const orderTotal = Math.round((cartTotal + shipping) * 100) / 100;

  // If the bag changes after payment has started, the amount is stale: start over
  const cartSignature = useMemo(() => cart.map((item) => `${item.id}x${item.quantity}`).join('|'), [cart]);
  const [paymentCartSignature, setPaymentCartSignature] = useState(null);
  const order = startedOrder && paymentCartSignature === cartSignature ? startedOrder : null;

  const handleDetails = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const form = new FormData(event.currentTarget);
    const nextDetails = {
      email: form.get('email'),
      name: form.get('name'),
      phone: form.get('phone'),
      address: {
        street: form.get('street'),
        street2: form.get('street2'),
        city: form.get('city'),
        state: form.get('state'),
        zipCode: form.get('zipCode'),
        country: 'United States',
      },
    };
    setDetails(nextDetails);

    if (!stripePromise) {
      setErrorMessage('Online payment is not set up yet. Please check back soon or contact us to order.');
      return;
    }

    setLoading(true);
    const result = await createOrder({
      ...nextDetails,
      items: cart.map((item) => ({
        productId: item.productId || item.id.split(':')[0],
        variantSku: item.variantSku,
        quantity: item.quantity,
      })),
    });
    setLoading(false);

    if (!result.success || !result.clientSecret) {
      setErrorMessage(result.message || 'We could not start your payment. Please try again.');
      return;
    }
    setPaymentCartSignature(cartSignature);
    setOrder({ orderNumber: result.orderNumber, clientSecret: result.clientSecret, total: result.amount });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (cartCount === 0) {
    return (
      <main className="pg co-empty">
        <PageHead eyebrow="Bag" title="Your bag" accent="is empty." sub="Take a look at our simple, plant-based essentials.">
          <div className="ap-ctas"><Link to="/shop" className="ap-pill">Shop the collection</Link></div>
        </PageHead>
      </main>
    );
  }

  const value = (name) => details?.[name] ?? '';
  const addressValue = (name) => details?.address?.[name] ?? '';

  return (
    <main className="pg co">
      <header className="co-head">
        <h1>Checkout</h1>
        <ol className="co-progress" aria-label="Checkout steps">
          <li className={order ? 'is-done' : 'is-current'}>Details</li>
          <li className={order ? 'is-current' : ''}>Payment</li>
        </ol>
      </header>
      <div className="co-layout">
        {order ? (
          <Elements stripe={stripePromise} options={{ clientSecret: order.clientSecret, appearance: stripeAppearance }} key={order.clientSecret}>
            <PaymentStep order={order} total={order.total} details={details} onEdit={() => setOrder(null)} />
          </Elements>
        ) : (
          <form onSubmit={handleDetails} className="co-form">
            <section className="pg-tile co-step">
              <h2>Contact information</h2>
              <label className="pg-field">Email address
                <input type="email" name="email" autoComplete="email" required defaultValue={value('email')} />
              </label>
              <label className="pg-field">Full name
                <input type="text" name="name" autoComplete="name" required defaultValue={value('name')} />
              </label>
              <label className="pg-field">Phone <small>(optional, for delivery updates)</small>
                <input type="tel" name="phone" autoComplete="tel" defaultValue={value('phone')} />
              </label>
            </section>
            <section className="pg-tile co-step">
              <h2>Shipping address</h2>
              <p className="pg-note">We ship within the United States, including U.S. territories.</p>
              <label className="pg-field">Street address
                <input type="text" name="street" autoComplete="address-line1" required defaultValue={addressValue('street')} />
              </label>
              <label className="pg-field">Apartment, suite, etc. <small>(optional)</small>
                <input type="text" name="street2" autoComplete="address-line2" defaultValue={addressValue('street2')} />
              </label>
              <div className="pg-row">
                <label className="pg-field">City
                  <input type="text" name="city" autoComplete="address-level2" required defaultValue={addressValue('city')} />
                </label>
                <label className="pg-field">State / territory
                  <select name="state" autoComplete="address-level1" required defaultValue={addressValue('state')}>
                    <option value="" disabled>Select</option>
                    {US_STATES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </select>
                </label>
              </div>
              <div className="pg-row">
                <label className="pg-field">ZIP code
                  <input type="text" name="zipCode" autoComplete="postal-code" inputMode="numeric" pattern="\d{5}(-\d{4})?" title="5-digit ZIP code" required defaultValue={addressValue('zipCode')} />
                </label>
                <label className="pg-field">Country
                  <input type="text" value="United States" readOnly aria-readonly="true" />
                </label>
              </div>
            </section>
            <p className="pg-note">
              Next, pay securely with card, Apple Pay or Google Pay. We’ll email your order confirmation and receipt, and tracking details when it ships.
            </p>
            {errorMessage && <p className="pg-error" role="alert">{errorMessage}</p>}
            <button className="ap-pill ap-pill--block" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : 'Continue to payment'}
            </button>
            <Link to="/shop" className="ap-link co-back">‹ Continue shopping</Link>
          </form>
        )}

        <aside className="co-summary">
          <h2>Your bag</h2>
          <div className="os-lines">
            {cart.map((item) => (
              <div className="os-line" key={item.id}>
                <ItemThumb item={item} />
                <div><strong>{item.name}</strong><span>Qty {item.quantity}</span></div>
                <b>{formatPrice(item.price * item.quantity)}</b>
              </div>
            ))}
          </div>
          <dl className="os-totals">
            <div><dt>Subtotal</dt><dd>{formatPrice(cartTotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
            <div className="os-total"><dt>Total</dt><dd>{formatPrice(orderTotal)}</dd></div>
          </dl>
          <p className="pg-note">
            {shipping === 0
              ? 'Your order qualifies for free U.S. shipping.'
              : `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - cartTotal)} more for free shipping.`}
            {' '}Delivery usually takes 2–7 business days via USPS or UPS; Alaska, Hawaii and U.S. territories may take longer.
          </p>
        </aside>
      </div>
    </main>
  );
}
