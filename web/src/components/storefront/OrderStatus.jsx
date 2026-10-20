import ItemThumb from './ItemThumb';
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
    <article className="os">
      <header className="os-head">
        <p className="pg-eyebrow">Order {order.orderNumber}</p>
        <h2>{headline(order)}</h2>
        <p className="pg-note">Placed {formatDate(order.createdAt)}</p>
      </header>

      {order.status !== 'CANCELLED' && (
        <ol className="os-steps">
          {STEPS.map((step, index) => (
            <li key={step.status} className={index <= current ? 'is-done' : ''}>
              <span className="os-dot" aria-hidden="true" />
              <b>{step.label}</b>
              {index <= current && formatDate(order[step.dateKey]) && <small>{formatDate(order[step.dateKey])}</small>}
            </li>
          ))}
        </ol>
      )}

      {order.trackingNumber && (
        <div className="os-tracking">
          <span>{order.carrier} tracking</span>
          <b>{order.trackingNumber}</b>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="ap-link">Track with {order.carrier} ›</a>
          )}
        </div>
      )}

      <div className="os-lines">
        {order.items.map((item, index) => (
          <div className="os-line" key={index}>
            <ItemThumb item={item} />
            <div><strong>{item.name}{item.variantName ? ` · ${item.variantName}` : ''}</strong><span>Qty {item.quantity}</span></div>
            <b>{formatPrice(item.price * item.quantity)}</b>
          </div>
        ))}
      </div>
      <dl className="os-totals">
        <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
        <div><dt>Shipping</dt><dd>{order.shippingFee ? formatPrice(order.shippingFee) : 'Free'}</dd></div>
        <div className="os-total"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
      </dl>

      <p className="pg-note">
        Shipping to {order.name}, {address.street}{address.street2 ? `, ${address.street2}` : ''}, {address.city}, {address.state} {address.zipCode}
      </p>

      {order.receiptUrl && (
        <a href={order.receiptUrl} target="_blank" rel="noreferrer" className="ap-link os-receipt">View or print receipt ›</a>
      )}
    </article>
  );
}
