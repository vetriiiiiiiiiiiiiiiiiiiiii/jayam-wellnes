import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { adminApi, mediaUrl } from '../../lib/adminApi';

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

// Editable list of rows (each row has the given fields), with reorder and remove
export function ListEditor({ label, items, onChange, fields, addLabel }) {
  const update = (index, key, value) => onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  const move = (index, delta) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };
  return (
    <fieldset className="ad-fieldset">
      <legend>{label}</legend>
      {items.length === 0 && <p className="ad-muted ad-small">None yet.</p>}
      {items.map((item, index) => (
        <div key={index} className="ad-list-row">
          <div className="ad-list-fields">
            {fields.map(({ key, placeholder, long, photo }) => (photo
              ? <PhotoField key={key} label={placeholder} value={item[key] || ''} onChange={(value) => update(index, key, value)} />
              : long
              ? <textarea key={key} rows={2} placeholder={placeholder} value={item[key] || ''} onChange={(event) => update(index, key, event.target.value)} />
              : <input key={key} placeholder={placeholder} value={item[key] || ''} onChange={(event) => update(index, key, event.target.value)} />))}
          </div>
          <div className="ad-list-actions">
            <button type="button" className="ad-icon-btn" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up"><ArrowUp size={16} /></button>
            <button type="button" className="ad-icon-btn" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move down"><ArrowDown size={16} /></button>
            <button type="button" className="ad-icon-btn ad-icon-btn--danger" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove"><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
      <button type="button" className="ad-btn ad-btn--ghost ad-btn--small" onClick={() => onChange([...items, Object.fromEntries(fields.map(({ key }) => [key, '']))])}>
        <Plus size={14} aria-hidden="true" /> {addLabel}
      </button>
    </fieldset>
  );
}

// Editable list of single lines (e.g. lifestyle tags), stored as an array of strings
export function StringList({ label, items, onChange, placeholder, addLabel }) {
  return (
    <ListEditor
      label={label}
      items={(items || []).map((text) => ({ text }))}
      onChange={(rows) => onChange(rows.map((row) => row.text))}
      fields={[{ key: 'text', placeholder }]}
      addLabel={addLabel}
    />
  );
}

// One photo: upload it or paste an address, with a preview
export function PhotoField({ label = 'Photo', hint, value, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    const result = await adminApi.uploadImage(file);
    setBusy(false);
    if (result.ok) onChange(result.data.url);
    else setError(result.message);
  };

  return (
    <div className="ad-field">
      <span>{label}{hint && <small> — {hint}</small>}</span>
      <div className="ad-photo-field">
        <span className="ad-photo-preview">{value ? <img src={mediaUrl(value)} alt="" /> : <small>No photo</small>}</span>
        <div className="ad-stack">
          <div className="ad-row">
            <button type="button" className="ad-btn ad-btn--ghost ad-btn--small" disabled={busy} onClick={() => input.current?.click()}>
              <ImagePlus size={14} aria-hidden="true" /> {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
            </button>
            {value && <button type="button" className="ad-link-text" onClick={() => onChange('')}>Remove</button>}
          </div>
          {error && <p className="ad-error ad-small">{error}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={upload} />
    </div>
  );
}
