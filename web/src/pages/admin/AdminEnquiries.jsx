import { useCallback, useEffect, useState } from 'react';
import { Reply } from 'lucide-react';
import { adminApi, formatDateTime } from '../../lib/adminApi';
import { ENQUIRY_CATEGORIES } from '../../lib/store';
import { Drawer, useNotice } from './adminBits';

const categoryLabel = (value) => ENQUIRY_CATEGORIES.find((category) => category.value === value)?.label || value;
const STATUSES = [
  { value: '', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'RESPONDED', label: 'Replied' },
  { value: 'CLOSED', label: 'Closed' },
];
const TONES = { NEW: 'amber', RESPONDED: 'blue', CLOSED: 'grey' };

export default function AdminEnquiries() {
  const [filter, setFilter] = useState('NEW');
  const [enquiries, setEnquiries] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [notice, notify] = useNotice();

  const load = useCallback(() => {
    adminApi.enquiries(filter).then((result) => (result.ok ? setEnquiries(result.data.data) : setError(result.message)));
  }, [filter]);
  useEffect(load, [load]);

  const setStatus = async (enquiry, status) => {
    const result = await adminApi.updateEnquiry(enquiry.id, status);
    if (!result.ok) return notify(result.message, 'error');
    notify('Enquiry updated');
    setOpen((current) => (current?.id === enquiry.id ? { ...current, status } : current));
    load();
  };

  if (error) return <p className="ad-error">{error}</p>;

  return (
    <div className="ad-page">
      {notice}
      <div className="ad-head">
        <div>
          <h1>Enquiries</h1>
          <p className="ad-muted">Messages from the contact form. Customers are promised a reply within 1 business day.</p>
        </div>
      </div>

      <div className="ad-toolbar">
        <div className="ad-tabs">
          {STATUSES.map(({ value, label }) => (
            <button key={label} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
      </div>

      <section className="ad-card ad-card--flush">
        {!enquiries ? (
          <p className="ad-muted ad-pad">Loading enquiries…</p>
        ) : enquiries.length === 0 ? (
          <p className="ad-muted ad-pad">Nothing here{filter === 'NEW' ? ' — you’re all caught up' : ''}.</p>
        ) : (
          <table className="ad-table ad-table--click">
            <thead><tr><th>From</th><th>Subject</th><th>Topic</th><th>Status</th><th>Received</th></tr></thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id} onClick={() => setOpen(enquiry)} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && setOpen(enquiry)}>
                  <td><b>{enquiry.name}</b><small>{enquiry.email}</small></td>
                  <td>{enquiry.subject}</td>
                  <td>{categoryLabel(enquiry.category)}</td>
                  <td><span className={`ad-badge ad-badge--${TONES[enquiry.status]}`}>{STATUSES.find((s) => s.value === enquiry.status)?.label}</span></td>
                  <td>{formatDateTime(enquiry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {open && (
        <Drawer title={open.subject} onClose={() => setOpen(null)}>
          <div className="ad-detail">
            <div className="ad-row">
              <span className={`ad-badge ad-badge--${TONES[open.status]}`}>{STATUSES.find((s) => s.value === open.status)?.label}</span>
              <span className="ad-muted">{categoryLabel(open.category)} · {formatDateTime(open.createdAt)}</span>
            </div>
            <section>
              <h3>From</h3>
              <p><b>{open.name}</b><br /><a href={`mailto:${open.email}`}>{open.email}</a>{open.phone ? <><br />{open.phone}</> : null}</p>
              {open.orderNumber && <p className="ad-muted">Order number: <b>{open.orderNumber}</b></p>}
            </section>
            <section>
              <h3>Message</h3>
              <p className="ad-message">{open.message}</p>
            </section>
            <div className="ad-row">
              <a
                className="ad-btn"
                href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`}
                onClick={() => open.status === 'NEW' && setStatus(open, 'RESPONDED')}
              >
                <Reply size={16} aria-hidden="true" /> Reply by email
              </a>
              {open.status !== 'RESPONDED' && <button type="button" className="ad-btn ad-btn--ghost" onClick={() => setStatus(open, 'RESPONDED')}>Mark replied</button>}
              {open.status !== 'CLOSED' && <button type="button" className="ad-btn ad-btn--ghost" onClick={() => setStatus(open, 'CLOSED')}>Close</button>}
              {open.status !== 'NEW' && <button type="button" className="ad-btn ad-btn--ghost" onClick={() => setStatus(open, 'NEW')}>Reopen</button>}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
