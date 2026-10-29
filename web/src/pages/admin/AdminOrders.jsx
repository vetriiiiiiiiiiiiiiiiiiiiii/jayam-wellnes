import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, Search } from 'lucide-react';
import { adminApi, formatDateTime } from '../../lib/adminApi';
import { formatPrice } from '../../lib/store';
import { Drawer, OrderBadge, PaymentBadge, useNotice } from './adminBits';

const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
const receiptUrl = (order) => `${base}/api/orders/${encodeURIComponent(order.orderNumber)}/receipt?token=${encodeURIComponent(order.accessToken)}`;

const VIEWS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'to-ship', label: 'To ship', test: (o) => o.paymentStatus === 'PAID' && o.status === 'PROCESSING' },
  { id: 'shipped', label: 'Shipped', test: (o) => o.status === 'SHIPPED' },
  { id: 'delivered', label: 'Delivered', test: (o) => o.status === 'DELIVERED' },
  { id: 'unpaid', label: 'Unpaid', test: (o) => o.paymentStatus === 'PENDING' && o.status === 'PENDING' },
  { id: 'cancelled', label: 'Cancelled', test: (o) => o.status === 'CANCELLED' },
];

function OrderDetail({ order, onChanged, notify }) {
  const [busy, setBusy] = useState(false);
  const address = order.address || {};
  const paid = order.paymentStatus === 'PAID';

  const update = async (body, message) => {
    setBusy(true);
    const result = await adminApi.updateOrder(order.id, body);
    setBusy(false);
    if (!result.ok) return notify(result.message, 'error');
    notify(result.data.emailQueued ? `${message} — the customer has been emailed` : message);
    onChanged(result.data.order);
  };

  const saveTracking = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    update({ carrier: form.get('carrier'), trackingNumber: String(form.get('trackingNumber')).trim() }, 'Tracking saved and order marked as shipped');
  };

  const cancel = async () => {
    const question = paid
      ? `Cancel ${order.orderNumber} and refund ${formatPrice(order.total)} to the customer?`
      : `Cancel ${order.orderNumber}?`;
    if (!window.confirm(question)) return;
    setBusy(true);
    const result = await adminApi.refundOrder(order.id);
    setBusy(false);
    if (!result.ok) return notify(result.message, 'error');
    notify(result.data.message);
    onChanged({ ...order, status: 'CANCELLED', paymentStatus: paid ? 'REFUNDED' : order.paymentStatus });
  };

  return (
    <div className="ad-detail">
      <div className="ad-row">
        <OrderBadge status={order.status} />
        <PaymentBadge status={order.paymentStatus} />
        <span className="ad-muted">Placed {formatDateTime(order.createdAt)}</span>
      </div>

      <section>
        <h3>Customer</h3>
        <p><b>{order.name}</b><br /><a href={`mailto:${order.email}`}>{order.email}</a>{order.phone ? <><br />{order.phone}</> : null}</p>
        <p className="ad-muted">
          {address.street}{address.street2 ? `, ${address.street2}` : ''}<br />
          {address.city}, {address.state} {address.zipCode}<br />
          {address.country || 'United States'}
        </p>
      </section>

      <section>
        <h3>Items</h3>
        <ul className="ad-lines">
          {order.items.map((item, index) => (
            <li key={index}>
              <span>{item.name}{item.variantName ? ` · ${item.variantName}` : ''} <small>× {item.quantity}</small></span>
              <b>{formatPrice(item.price * item.quantity)}</b>
            </li>
          ))}
          <li className="ad-lines-sub"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></li>
          <li className="ad-lines-sub"><span>Shipping</span><span>{order.shippingFee ? formatPrice(order.shippingFee) : 'Free'}</span></li>
          <li className="ad-lines-total"><span>Total</span><b>{formatPrice(order.total)}</b></li>
        </ul>
        {(paid || order.paymentStatus === 'REFUNDED') && (
          <a href={receiptUrl(order)} target="_blank" rel="noreferrer" className="ad-link-text">View receipt <ExternalLink size={13} aria-hidden="true" /></a>
        )}
      </section>

      {paid && order.status !== 'CANCELLED' && (
        <section>
          <h3>Shipping</h3>
          {order.trackingNumber && (
            <p className="ad-muted">Current tracking: <b>{order.carrier} {order.trackingNumber}</b>{order.shippedAt ? ` · shipped ${formatDateTime(order.shippedAt)}` : ''}</p>
          )}
          <form className="ad-inline-form" onSubmit={saveTracking}>
            <select name="carrier" defaultValue={order.carrier || 'USPS'} aria-label="Carrier">
              <option value="USPS">USPS</option>
              <option value="UPS">UPS</option>
            </select>
            <input name="trackingNumber" placeholder="Tracking number" defaultValue={order.trackingNumber || ''} required aria-label="Tracking number" />
            <button type="submit" className="ad-btn" disabled={busy}>{order.trackingNumber ? 'Update tracking' : 'Save & mark shipped'}</button>
          </form>
          <p className="ad-muted ad-small">Saving tracking emails the customer a shipping notice with the tracking link.</p>
          {order.status === 'SHIPPED' && (
            <button type="button" className="ad-btn ad-btn--ghost" disabled={busy} onClick={() => update({ status: 'DELIVERED' }, 'Marked as delivered')}>Mark as delivered</button>
          )}
        </section>
      )}

      {order.status !== 'CANCELLED' && (
        <section className="ad-danger-zone">
          <h3>Cancel order</h3>
          <p className="ad-muted ad-small">{paid ? 'Cancelling refunds the full amount through Stripe and returns the items to stock.' : 'The order has not been paid; cancelling releases the reserved stock.'}</p>
          <button type="button" className="ad-btn ad-btn--danger" disabled={busy} onClick={cancel}>{paid ? 'Cancel and refund' : 'Cancel order'}</button>
        </section>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [notice, notify] = useNotice();
  const view = params.get('view') || 'all';
  const openId = params.get('open');

  const load = useCallback(() => {
    adminApi.orders().then((result) => (result.ok ? setOrders(result.data.data) : setError(result.message)));
  }, []);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const test = VIEWS.find((item) => item.id === view)?.test || (() => true);
    const q = query.trim().toLowerCase();
    return orders.filter(test).filter((order) => !q || [order.orderNumber, order.name, order.email].some((field) => field?.toLowerCase().includes(q)));
  }, [orders, view, query]);

  const counts = useMemo(() => Object.fromEntries(VIEWS.map(({ id, test }) => [id, (orders || []).filter(test).length])), [orders]);
  const open = orders?.find((order) => order.id === openId);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const changed = (updated) => setOrders((current) => current.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)));

  if (error) return <p className="ad-error">{error}</p>;

  return (
    <div className="ad-page">
      {notice}
      <div className="ad-head">
        <div>
          <h1>Orders</h1>
          <p className="ad-muted">Add tracking to ship an order — the customer is emailed automatically.</p>
        </div>
      </div>

      <div className="ad-toolbar">
        <div className="ad-tabs">
          {VIEWS.map(({ id, label }) => (
            <button key={id} type="button" className={view === id ? 'is-active' : ''} onClick={() => setParam('view', id === 'all' ? null : id)}>
              {label} <span>{counts[id]}</span>
            </button>
          ))}
        </div>
        <label className="ad-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Order number, name or email" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search orders" />
        </label>
      </div>

      <section className="ad-card ad-card--flush">
        {!orders ? (
          <p className="ad-muted ad-pad">Loading orders…</p>
        ) : filtered.length === 0 ? (
          <p className="ad-muted ad-pad">{orders.length === 0 ? 'No orders yet.' : 'No orders match this view.'}</p>
        ) : (
          <table className="ad-table ad-table--click">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Status</th><th className="ad-num">Total</th></tr></thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} onClick={() => setParam('open', order.id)} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && setParam('open', order.id)}>
                  <td><b>{order.orderNumber}</b><small>{formatDateTime(order.createdAt)}</small></td>
                  <td>{order.name}<small>{order.email}</small></td>
                  <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td><OrderBadge status={order.status} /> <PaymentBadge status={order.paymentStatus} /></td>
                  <td className="ad-num">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {open && (
        <Drawer title={`Order ${open.orderNumber}`} onClose={() => setParam('open', null)}>
          <OrderDetail order={open} onChanged={changed} notify={notify} />
        </Drawer>
      )}
    </div>
  );
}
