import { formatPrice } from '../../lib/store';

const STEPS = [
  { status: 'PROCESSING', label: 'Order confirmed', dateKey: 'paidAt' },
  { status: 'SHIPPED', label: 'Shipped', dateKey: 'shippedAt' },
  { status: 'DELIVERED', label: 'Delivered', dateKey: 'deliveredAt' },
];
const STEP_INDEX = { PENDING: -1, PROCESSING: 0, SHIPPED: 1, DELIVERED: 2 };

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

const headline = (order) => {
  if (order.status === 'CANCELLED') return order.paymentStatus === 'REFUNDED' ? 'Cancelled and refunded' : 'Cancelled';
  if (order.paymentStatus !== 'PAID') return 'Awaiting payment';
  return { PROCESSING: 'Preparing your order', SHIPPED: 'On its way', DELIVERED: 'Delivered' }[order.status] || 'Order received';
};

// Order summary shared by the checkout success and track-your-order pages
export default function OrderStatus({ order }) {
  const current = order.paymentStatus === 'PAID' ? STEP_INDEX[order.status] ?? -1 : -1;
  const address = order.address || {};

  return (
    <article className="jayam-order-status">
      <header>
        <p className="jayam-eyebrow">Order {order.orderNumber}</p>
        <h2>{headline(order)}</h2>
        <p className="jayam-checkout-note">Placed {formatDate(order.createdAt)}</p>
      </header>

      {order.status !== 'CANCELLED' && (
        <ol className="jayam-order-steps">
          {STEPS.map((step, index) => (
            <li key={step.status} className={index <= current ? 'is-done' : ''}>
              <span>{step.label}</span>
              {index <= current && formatDate(order[step.dateKey]) && <small>{formatDate(order[step.dateKey])}</small>}
            </li>
          ))}
        </ol>
      )}

      {order.trackingNumber && (
        <div className="jayam-order-tracking">
          <span>{order.carrier} tracking</span>
          <b>{order.trackingNumber}</b>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="jayam-primary-link">
              Track with {order.carrier} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}

      <div className="jayam-order-lines">
        {order.items.map((item, index) => (
          <div className="jayam-order-line" key={index}>
            {item.image ? <img src={item.image} alt="" /> : <span className="jayam-order-image-placeholder">J</span>}
            <div><strong>{item.name}{item.variantName ? ` · ${item.variantName}` : ''}</strong><span>Qty {item.quantity}</span></div>
            <b>{formatPrice(item.price * item.quantity)}</b>
          </div>
        ))}
      </div>
      <div className="jayam-order-total"><span>Subtotal</span><b>{formatPrice(order.subtotal)}</b></div>
      <div className="jayam-order-total"><span>Shipping</span><b>{order.shippingFee ? formatPrice(order.shippingFee) : 'Free'}</b></div>
      <div className="jayam-order-total"><span>Total</span><b>{formatPrice(order.total)}</b></div>

      <p className="jayam-checkout-note jayam-order-shipto">
        Shipping to {order.name}, {address.street}{address.street2 ? `, ${address.street2}` : ''}, {address.city}, {address.state} {address.zipCode}
      </p>

      {order.receiptUrl && (
        <a href={order.receiptUrl} target="_blank" rel="noreferrer" className="jayam-primary-link">
          View / print receipt <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}
