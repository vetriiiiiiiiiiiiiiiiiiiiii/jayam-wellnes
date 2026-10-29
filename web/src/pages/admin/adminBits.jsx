import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// Small building blocks shared by the admin pages

const ORDER_TONES = { PENDING: 'grey', PROCESSING: 'amber', SHIPPED: 'blue', DELIVERED: 'green', CANCELLED: 'red' };
const ORDER_LABELS = { PENDING: 'Pending', PROCESSING: 'To ship', SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
const PAYMENT_TONES = { PENDING: 'grey', PAID: 'green', FAILED: 'red', REFUNDED: 'red' };

export function OrderBadge({ status }) {
  return <span className={`ad-badge ad-badge--${ORDER_TONES[status] || 'grey'}`}>{ORDER_LABELS[status] || status}</span>;
}

export function PaymentBadge({ status }) {
  return <span className={`ad-badge ad-badge--${PAYMENT_TONES[status] || 'grey'} ad-badge--soft`}>{status === 'PAID' ? 'Paid' : status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}

// Side panel used for order details and editors
export function Drawer({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="ad-drawer-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="ad-drawer-scrim" aria-label="Close" onClick={onClose} />
      <div className={`ad-drawer${wide ? ' ad-drawer--wide' : ''}`}>
        <header className="ad-drawer-head">
          <h2>{title}</h2>
          <button type="button" className="ad-icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </header>
        <div className="ad-drawer-body">{children}</div>
      </div>
    </div>
  );
}

// A short-lived confirmation message
export function useNotice() {
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  const element = notice ? <div className={`ad-notice ad-notice--${notice.tone || 'ok'}`} role="status">{notice.text}</div> : null;
  return [element, (text, tone) => setNotice({ text, tone })];
}
