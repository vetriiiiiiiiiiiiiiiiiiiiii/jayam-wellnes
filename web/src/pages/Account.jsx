import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import PageHead from '../components/storefront/PageHead';
import { authApi, useAuth } from '../lib/auth';
import { formatPrice } from '../lib/store';
import usePageMeta from '../lib/usePageMeta';

const STATUS_LABELS = {
  PENDING: 'Awaiting payment',
  PROCESSING: 'Preparing',
  SHIPPED: 'On its way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function AccountPage() {
  usePageMeta({ title: 'Your account', noindex: true });
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate('/login?next=/account', { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    authApi.get('orders/my-orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => setOrders([]));
  }, [user]);

  if (loading || !user) return <main className="pg"><p className="pg-note" style={{ textAlign: 'center' }}>Loading…</p></main>;

  const leave = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <main className="pg ac">
      <PageHead eyebrow="Account" title={`Hello, ${(user.fullname || 'there').split(' ')[0]}.`} sub={user.email}>
        <div className="ap-ctas" style={{ justifyContent: 'center', marginTop: 24 }}>
          {isAdmin && <Link to="/admin" className="ap-pill"><LayoutDashboard size={16} aria-hidden="true" /> Store dashboard</Link>}
          <button type="button" className="ap-pill ap-pill--outline" onClick={leave}><LogOut size={16} aria-hidden="true" /> Sign out</button>
        </div>
      </PageHead>

      <section className="ac-orders" aria-labelledby="ac-orders-title">
        <h2 id="ac-orders-title" className="pg-section-title">Your <em>orders.</em></h2>
        {orders === null ? (
          <p className="pg-note" style={{ textAlign: 'center' }}>Loading your orders…</p>
        ) : orders.length === 0 ? (
          <div className="pg-empty">
            <h2>No orders yet.</h2>
            <p>Orders placed while signed in{user.hasGoogle ? ', or with your Google email,' : ''} show up here.</p>
            <Link to="/shop" className="ap-pill">Shop the collection</Link>
          </div>
        ) : (
          <ul className="ac-list">
            {orders.map((order) => (
              <li key={order.id} className="ac-order">
                <div>
                  <p className="ac-number">{order.orderNumber}</p>
                  <p className="pg-note">{formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                </div>
                <span className={`ac-status ac-status--${order.status.toLowerCase()}`}>{STATUS_LABELS[order.status] || order.status}</span>
                <b>{formatPrice(order.total)}</b>
                <Link to={`/track-order?order=${encodeURIComponent(order.orderNumber)}`} className="ap-link">Details ›</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
