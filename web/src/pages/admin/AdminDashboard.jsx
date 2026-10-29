import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Mail, Package, ShoppingBag, Truck, Users } from 'lucide-react';
import { adminApi, formatDateTime } from '../../lib/adminApi';
import { formatPrice } from '../../lib/store';
import { OrderBadge, PaymentBadge } from './adminBits';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.dashboard().then((result) => (result.ok ? setStats(result.data) : setError(result.message)));
  }, []);

  if (error) return <p className="ad-error">{error}</p>;
  if (!stats) return <p className="ad-muted">Loading the dashboard…</p>;

  const tiles = [
    { label: 'Revenue, last 30 days', value: formatPrice(stats.revenue30), note: `${stats.orders30} paid orders`, icon: ShoppingBag },
    { label: 'Ready to ship', value: stats.toShip, note: 'Paid and waiting for tracking', icon: Truck, to: '/admin/orders?view=to-ship', alert: stats.toShip > 0 },
    { label: 'New enquiries', value: stats.newEnquiries, note: 'Waiting for a reply', icon: Mail, to: '/admin/enquiries', alert: stats.newEnquiries > 0 },
    { label: 'Customers', value: stats.customers, note: `${formatPrice(stats.totalRevenue)} all-time revenue`, icon: Users, to: '/admin/users' },
  ];

  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Good to see you.</h1>
          <p className="ad-muted">Here’s how the store is doing.</p>
        </div>
        <Link to="/admin/products/new" className="ad-btn"><Package size={16} aria-hidden="true" /> Add a product</Link>
      </div>

      <div className="ad-tiles">
        {tiles.map(({ label, value, note, icon: Icon, to, alert }) => {
          const body = (
            <>
              <span className="ad-tile-icon"><Icon size={18} aria-hidden="true" /></span>
              <p className="ad-tile-label">{label}</p>
              <p className="ad-tile-value">{value}</p>
              <p className="ad-muted">{note}</p>
            </>
          );
          return to
            ? <Link key={label} to={to} className={`ad-tile${alert ? ' ad-tile--alert' : ''}`}>{body}</Link>
            : <div key={label} className="ad-tile">{body}</div>;
        })}
      </div>

      <div className="ad-grid-2">
        <section className="ad-card">
          <div className="ad-card-head">
            <h2>Recent orders</h2>
            <Link to="/admin/orders" className="ad-link-text">All orders ›</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="ad-muted">No orders yet. They’ll appear here as soon as customers check out.</p>
          ) : (
            <table className="ad-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="ad-num">Total</th></tr></thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><Link to={`/admin/orders?open=${order.id}`} className="ad-link-text">{order.orderNumber}</Link><small>{formatDateTime(order.createdAt)}</small></td>
                    <td>{order.name}<small>{order.email}</small></td>
                    <td><OrderBadge status={order.status} /> <PaymentBadge status={order.paymentStatus} /></td>
                    <td className="ad-num">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div className="ad-stack">
          <section className="ad-card">
            <div className="ad-card-head"><h2>Low stock</h2></div>
            {stats.lowStock.length === 0 ? (
              <p className="ad-muted">Every published product has 10 or more in stock.</p>
            ) : (
              <ul className="ad-list">
                {stats.lowStock.map((product) => (
                  <li key={product.id}>
                    <Link to={`/admin/products/${product.id}`} className="ad-link-text">{product.name}</Link>
                    <span className={`ad-badge ${product.stockQuantity === 0 ? 'ad-badge--red' : 'ad-badge--amber'}`}>
                      <AlertTriangle size={12} aria-hidden="true" /> {product.stockQuantity} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ad-card">
            <div className="ad-card-head"><h2>Best sellers</h2></div>
            {stats.topProducts.length === 0 ? (
              <p className="ad-muted">Best sellers show up after the first paid orders.</p>
            ) : (
              <ul className="ad-list">
                {stats.topProducts.map((item) => <li key={item.name}><span>{item.name}</span><b>{item.quantity} sold</b></li>)}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
