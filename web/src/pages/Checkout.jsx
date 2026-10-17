import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useCart } from '../components/storefront/CartProvider';
import { createOrder } from '../services/api';
import { FREE_SHIPPING_THRESHOLD, US_STATES, formatPrice, shippingFor } from '../lib/store';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const stripeAppearance = {
  theme: 'flat',
  variables: {
    colorPrimary: '#20372b',
    colorText: '#20372b',
    colorBackground: '#f2efe6',
    colorDanger: '#7b3026',
    fontFamily: 'Manrope, system-ui, sans-serif',
    borderRadius: '0px',
  },
  rules: {
    '.Input': { border: '1px solid #c8c4b8' },
    '.Tab': { border: '1px solid #d2cec2' },
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
    <form onSubmit={handlePay} className="jayam-checkout-form">
      <section>
        <h2>Shipping to</h2>
        <div className="jayam-checkout-review">
          <p>
            {details.name} · {details.email}<br />
            {address.street}{address.street2 ? `, ${address.street2}` : ''}<br />
            {address.city}, {address.state} {address.zipCode}
          </p>
          <button type="button" onClick={onEdit} disabled={paying}>Edit</button>
        </div>
      </section>
      <section>
        <h2>Payment</h2>
        <p className="jayam-checkout-note">All payments are processed securely by Stripe in U.S. dollars.</p>
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: { billingDetails: { name: 'never', email: 'never', phone: 'never' } },
          }}
        />
      </section>
      {errorMessage && <p className="jayam-checkout-error" role="alert">{errorMessage}</p>}
      <button className="jayam-place-order" type="submit" disabled={!stripe || paying}>
        {paying ? 'Processing…' : `Pay ${formatPrice(total)}`}
      </button>
      <p className="jayam-checkout-note">Order {order.orderNumber}</p>
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
      <main className="jayam-checkout-empty">
        <p className="jayam-eyebrow">Your bag is waiting</p>
        <h1>Your bag is<br /><em>empty.</em></h1>
        <p>Take a look at our thoughtfully chosen wellness essentials.</p>
        <Link to="/shop" className="jayam-primary-link">Continue shopping <span aria-hidden="true">↗</span></Link>
      </main>
    );
  }

  const value = (name) => details?.[name] ?? '';
  const addressValue = (name) => details?.address?.[name] ?? '';

  return (
    <main className="jayam-checkout">
      <header className="jayam-checkout-heading">
        <p className="jayam-eyebrow">{order ? 'Step 2 of 2' : 'Step 1 of 2'}</p>
        <h1>Checkout</h1>
      </header>
      <div className="jayam-checkout-layout">
        {order ? (
          <Elements stripe={stripePromise} options={{ clientSecret: order.clientSecret, appearance: stripeAppearance }} key={order.clientSecret}>
            <PaymentStep order={order} total={order.total} details={details} onEdit={() => setOrder(null)} />
          </Elements>
        ) : (
          <form onSubmit={handleDetails} className="jayam-checkout-form">
            <section>
              <h2>Contact information</h2>
              <label>Email address
                <input type="email" name="email" autoComplete="email" required defaultValue={value('email')} />
              </label>
              <label>Full name
                <input type="text" name="name" autoComplete="name" required defaultValue={value('name')} />
              </label>
              <label>Phone <small>(optional, for delivery updates)</small>
                <input type="tel" name="phone" autoComplete="tel" defaultValue={value('phone')} />
              </label>
            </section>
            <section>
              <h2>Shipping address</h2>
              <p className="jayam-checkout-note">We ship within the United States, including U.S. territories.</p>
              <label>Street address
                <input type="text" name="street" autoComplete="address-line1" required defaultValue={addressValue('street')} />
              </label>
              <label>Apartment, suite, etc. <small>(optional)</small>
                <input type="text" name="street2" autoComplete="address-line2" defaultValue={addressValue('street2')} />
              </label>
              <div className="jayam-checkout-fields">
                <label>City
                  <input type="text" name="city" autoComplete="address-level2" required defaultValue={addressValue('city')} />
                </label>
                <label>State / territory
                  <select name="state" autoComplete="address-level1" required defaultValue={addressValue('state')}>
                    <option value="" disabled>Select</option>
                    {US_STATES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </select>
                </label>
              </div>
              <div className="jayam-checkout-fields">
                <label>ZIP code
                  <input type="text" name="zipCode" autoComplete="postal-code" inputMode="numeric" pattern="\d{5}(-\d{4})?" title="5-digit ZIP code" required defaultValue={addressValue('zipCode')} />
                </label>
                <label>Country
                  <input type="text" value="United States" readOnly aria-readonly="true" />
                </label>
              </div>
            </section>
            <p className="jayam-checkout-note">
              Next, pay securely with card, Apple Pay or Google Pay. We’ll email your order confirmation and receipt, and tracking details when it ships.
            </p>
            {errorMessage && <p className="jayam-checkout-error" role="alert">{errorMessage}</p>}
            <button className="jayam-place-order" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : 'Continue to payment'}
            </button>
            <Link to="/shop" className="jayam-back-to-shop">← Continue shopping</Link>
          </form>
        )}

        <aside className="jayam-checkout-summary">
          <h2>Your order</h2>
          <div className="jayam-order-lines">
            {cart.map((item) => (
              <div className="jayam-order-line" key={item.id}>
                {item.image ? <img src={item.image} alt="" /> : <span className="jayam-order-image-placeholder">J</span>}
                <div><strong>{item.name}</strong><span>Qty {item.quantity}</span></div>
                <b>{formatPrice(item.price * item.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="jayam-order-total"><span>Subtotal</span><b>{formatPrice(cartTotal)}</b></div>
          <div className="jayam-order-total"><span>Shipping</span><b>{shipping === 0 ? 'Free' : formatPrice(shipping)}</b></div>
          <div className="jayam-order-total"><span>Total</span><b>{formatPrice(orderTotal)}</b></div>
          <p>
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
