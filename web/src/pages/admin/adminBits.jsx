import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { adminApi, mediaUrl } from '../../lib/adminApi';

// Small building blocks shared by the admin pages

const ORDER_TONES = { PENDING: 'grey', PROCESSING: 'amber', SHIPPED: 'blue', DELIVERED: 'green', CANCELLED: 'red' };
const ORDER_LABELS = { PENDING: 'Pending', PROCESSING: 'To ship', SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
const PAYMENT_TONES = { PENDING: 'grey', PAID: 'green', FAILED: 'red', REFUNDED: 'red', PARTIALLY_REFUNDED: 'amber' };
const PAYMENT_LABELS = { PENDING: 'Unpaid', PAID: 'Paid', FAILED: 'Failed', REFUNDED: 'Refunded', PARTIALLY_REFUNDED: 'Partly refunded' };

export function OrderBadge({ status }) {
  return <span className={`ad-badge ad-badge--${ORDER_TONES[status] || 'grey'}`}>{ORDER_LABELS[status] || status}</span>;
}

export function PaymentBadge({ status }) {
  return <span className={`ad-badge ad-badge--${PAYMENT_TONES[status] || 'grey'} ad-badge--soft`}>{PAYMENT_LABELS[status] || status}</span>;
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
            {fields.map(({ key, placeholder, long, photo, ratio, round }) => (photo
              ? <PhotoField key={key} label={placeholder} ratio={ratio} round={round} value={item[key] || ''} onChange={(value) => update(index, key, value)} />
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

// Crops a chosen photo to the frame it is shown in: drag to move, slide to zoom.
// The cropped picture is what gets uploaded, so it always fits the page exactly.
const clampCentre = (centre, shown, frame) => (shown <= frame ? 0.5 : Math.min(1 - frame / (2 * shown), Math.max(frame / (2 * shown), centre)));

export function PhotoCropper({ file, ratio, round = false, overlay = null, onCancel, onCrop }) {
  const [src, setSrc] = useState('');
  const [natural, setNatural] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [centre, setCentre] = useState({ x: 0.5, y: 0.5 });
  const [busy, setBusy] = useState(false);
  const drag = useRef(null);
  const image = useRef(null);
  const [frame] = useState(() => {
    let width = Math.min(520, window.innerWidth * 0.84);
    let height = width / ratio;
    const maxHeight = window.innerHeight * 0.55;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
    return { width, height };
  });

  // Made and released inside the effect, so a remount never leaves a released address behind
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const scale = natural ? Math.max(frame.width / natural.width, frame.height / natural.height) * zoom : 1;
  const shownW = natural ? natural.width * scale : 0;
  const shownH = natural ? natural.height * scale : 0;
  const cx = clampCentre(centre.x, shownW, frame.width);
  const cy = clampCentre(centre.y, shownH, frame.height);

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, cx, cy };
  };
  const onPointerMove = (event) => {
    if (!drag.current || !natural) return;
    const { x, y, cx: startX, cy: startY } = drag.current;
    setCentre({ x: startX - (event.clientX - x) / shownW, y: startY - (event.clientY - y) / shownH });
  };
  const onPointerUp = () => { drag.current = null; };

  const crop = () => {
    if (!natural) return;
    setBusy(true);
    const cropW = frame.width / scale;
    const cropH = frame.height / scale;
    const outW = Math.round(Math.min(cropW, 1800));
    const outH = Math.round(outW / ratio);
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    canvas.getContext('2d').drawImage(image.current, cx * natural.width - cropW / 2, cy * natural.height - cropH / 2, cropW, cropH, 0, 0, outW, outH);
    canvas.toBlob((blob) => {
      if (!blob) { setBusy(false); return; }
      const type = blob.type || 'image/png';
      const name = `${file.name.replace(/\.[^.]+$/, '') || 'photo'}-cropped.${type.split('/')[1] || 'png'}`;
      onCrop(new File([blob], name, { type }));
    }, 'image/webp', 0.92);
  };

  return (
    <div className="ad-crop-wrap" role="dialog" aria-modal="true" aria-label="Crop photo">
      <div className="ad-crop">
        <h2>Crop the photo</h2>
        <p className="ad-muted ad-small">Drag the photo to choose what shows, and zoom in if you like. It will fill this frame on the site.</p>
        <div
          className={`ad-crop-frame${round ? ' ad-crop-frame--round' : ''}`}
          style={{ width: frame.width, height: frame.height }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src && <img
            ref={image}
            src={src}
            alt=""
            draggable={false}
            onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            style={natural ? { width: shownW, height: shownH, left: frame.width / 2 - cx * shownW, top: frame.height / 2 - cy * shownH } : { opacity: 0 }}
          />}
          {overlay && <div className="ad-crop-overlay" aria-hidden="true">{overlay}</div>}
        </div>
        <label className="ad-crop-zoom">
          <span>Zoom</span>
          <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
        </label>
        <div className="ad-row ad-crop-actions">
          <button type="button" className="ad-btn ad-btn--ghost" onClick={() => { setZoom(1); setCentre({ x: 0.5, y: 0.5 }); }} disabled={busy}>Auto fit</button>
          <button type="button" className="ad-btn ad-btn--ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="ad-btn" onClick={crop} disabled={busy || !natural}>{busy ? 'Saving…' : 'Use this crop'}</button>
        </div>
      </div>
    </div>
  );
}

// One photo: upload it or paste an address, with a preview. With a ratio, the photo is
// cropped to that shape before it is uploaded.
export function PhotoField({ label = 'Photo', hint, value, onChange, ratio, round = false, overlay = null }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cropping, setCropping] = useState(null);

  const send = async (file) => {
    setBusy(true);
    setError('');
    const result = await adminApi.uploadImage(file);
    setBusy(false);
    if (result.ok) onChange(result.data.url);
    else setError(result.message);
  };

  const upload = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (ratio) setCropping(file);
    else send(file);
  };

  return (
    <div className="ad-field">
      <span>{label}{hint && <small> — {hint}</small>}</span>
      <div className="ad-photo-field">
        <span className={`ad-photo-preview${round ? ' ad-photo-preview--round' : ''}`} style={ratio ? { aspectRatio: String(ratio), height: 'auto' } : undefined}>{value ? <img src={mediaUrl(value)} alt="" /> : <small>No photo</small>}</span>
        <div className="ad-stack">
          <div className="ad-row">
            <button type="button" className="ad-btn ad-btn--ghost ad-btn--small" disabled={busy} onClick={() => input.current?.click()}>
              <ImagePlus size={14} aria-hidden="true" /> {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
            </button>
            {value && <button type="button" className="ad-link-text" onClick={() => onChange('')}>Remove</button>}
          </div>
          {ratio && <p className="ad-muted ad-small">Any size works: you’ll crop it to fit after choosing it.</p>}
          {error && <p className="ad-error ad-small">{error}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={upload} />
      {cropping && (
        <PhotoCropper
          file={cropping}
          ratio={ratio}
          round={round}
          overlay={overlay}
          onCancel={() => setCropping(null)}
          onCrop={(file) => { setCropping(null); send(file); }}
        />
      )}
    </div>
  );
}
