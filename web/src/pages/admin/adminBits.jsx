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

// ---------- Photo library picker ----------
// Every photo field opens this: pick a photo from the library (Admin → Assets) or upload a
// new one, crop it to the shape it is shown in (drag, zoom, or Auto fit), check the preview,
// then use it. Uploads and crops are both kept in the library to reuse.

const clampCentre = (centre, shown, frame) => (shown <= frame ? 0.5 : Math.min(1 - frame / (2 * shown), Math.max(frame / (2 * shown), centre)));

const frameFor = (ratio) => {
  let width = Math.min(520, window.innerWidth * 0.84);
  let height = width / ratio;
  const maxHeight = window.innerHeight * 0.52;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }
  return { width, height };
};

const formatSize = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

// Upload one or more files to the library; resolves with the new addresses
export const uploadToLibrary = async (files) => {
  const urls = [];
  for (const file of files) {
    const result = await adminApi.uploadImage(file);
    if (!result.ok) return { urls, error: result.message };
    urls.push(result.data.url);
  }
  return { urls };
};

// The library grid, shared by the picker and the Assets page
export function AssetGrid({ assets, selected, onSelect, renderActions }) {
  if (!assets) return <p className="ad-muted ad-small">Loading photos…</p>;
  if (assets.length === 0) return <p className="ad-muted ad-small">No photos yet. Upload one to start the library.</p>;
  return (
    <ul className="ad-assets">
      {assets.map((asset) => (
        <li key={asset.url} className={selected === asset.url ? 'is-selected' : ''}>
          <button type="button" className="ad-asset-thumb" onClick={() => onSelect?.(asset)} title={asset.url.split('/').pop()}>
            <img src={mediaUrl(asset.url)} alt="" loading="lazy" />
            {asset.inUse && <span className="ad-asset-tag">In use</span>}
          </button>
          <div className="ad-asset-meta">
            <small>{formatSize(asset.size)} · {new Date(asset.createdAt).toLocaleDateString()}</small>
            {renderActions?.(asset)}
          </div>
        </li>
      ))}
    </ul>
  );
}

function CropStep({ url, ratio, round, overlay, busy, onBack, onCrop }) {
  const [natural, setNatural] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [centre, setCentre] = useState({ x: 0.5, y: 0.5 });
  const drag = useRef(null);
  const [frame] = useState(() => frameFor(ratio));

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
    const width = frame.width / shownW;
    const height = frame.height / shownH;
    onCrop({ left: cx - width / 2, top: cy - height / 2, width, height });
  };

  return (
    <>
      <p className="ad-muted ad-small ad-picker-hint">Drag the photo to choose what shows and zoom in if you like. It fills this shape on the site.</p>
      <div
        className={`ad-crop-frame${round ? ' ad-crop-frame--round' : ''}`}
        style={{ width: frame.width, height: frame.height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={mediaUrl(url)}
          alt=""
          draggable={false}
          onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
          style={natural ? { width: shownW, height: shownH, left: frame.width / 2 - cx * shownW, top: frame.height / 2 - cy * shownH } : { opacity: 0 }}
        />
        {overlay && <div className="ad-crop-overlay" aria-hidden="true">{overlay}</div>}
      </div>
      <label className="ad-crop-zoom">
        <span>Zoom</span>
        <input type="range" min="1" max="4" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
      </label>
      <div className="ad-row ad-crop-actions">
        <button type="button" className="ad-btn ad-btn--ghost" onClick={onBack} disabled={busy}>Back to photos</button>
        <button type="button" className="ad-btn ad-btn--ghost" onClick={() => { setZoom(1); setCentre({ x: 0.5, y: 0.5 }); }} disabled={busy}>Auto fit</button>
        <button type="button" className="ad-btn" onClick={crop} disabled={busy || !natural}>{busy ? 'Cropping…' : 'Crop and preview'}</button>
      </div>
    </>
  );
}

export function PhotoPicker({ ratio, round = false, overlay = null, title = 'Choose a photo', current, onClose, onPick }) {
  const [assets, setAssets] = useState(null);
  const [step, setStep] = useState('library'); // library → crop → preview
  const [source, setSource] = useState(null); // the library photo being cropped
  const [result, setResult] = useState(null); // the photo to use
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef(null);

  const load = () => adminApi.assets().then((res) => setAssets(res.ok ? res.data.assets : []));
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const choose = (url) => {
    setError('');
    setSource(url);
    setResult(url);
    setStep(ratio ? 'crop' : 'preview');
  };

  const upload = async (event) => {
    const files = [...event.target.files];
    event.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setError('');
    const { urls, error: failed } = await uploadToLibrary(files);
    setBusy(false);
    if (failed) setError(failed);
    load();
    if (urls.length === 1) choose(urls[0]);
  };

  const crop = async (area) => {
    setBusy(true);
    setError('');
    const res = await adminApi.cropAsset({ url: source, ...area });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    setResult(res.data.url);
    setStep('preview');
    load();
  };

  return (
    <div className="ad-crop-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`ad-crop ad-picker ad-picker--${step}`}>
        <div className="ad-picker-head">
          <h2>{step === 'library' ? title : step === 'crop' ? 'Crop to fit' : 'Preview'}</h2>
          <ol className="ad-picker-steps" aria-label="Steps">
            <li className={step === 'library' ? 'is-on' : ''}>1 · Photo</li>
            {ratio && <li className={step === 'crop' ? 'is-on' : ''}>2 · Crop</li>}
            <li className={step === 'preview' ? 'is-on' : ''}>{ratio ? '3' : '2'} · Preview</li>
          </ol>
          <button type="button" className="ad-icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {error && <p className="ad-error ad-small">{error}</p>}

        {step === 'library' && (
          <>
            <div className="ad-row ad-picker-bar">
              <button type="button" className="ad-btn" onClick={() => input.current?.click()} disabled={busy}>
                <ImagePlus size={15} aria-hidden="true" /> {busy ? 'Uploading…' : 'Upload new photo'}
              </button>
              <span className="ad-muted ad-small">or pick one you uploaded before</span>
            </div>
            <div className="ad-picker-grid">
              <AssetGrid assets={assets} selected={current} onSelect={(asset) => choose(asset.url)} />
            </div>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden multiple onChange={upload} />
          </>
        )}

        {step === 'crop' && source && (
          <CropStep url={source} ratio={ratio} round={round} overlay={overlay} busy={busy} onBack={() => setStep('library')} onCrop={crop} />
        )}

        {step === 'preview' && result && (
          <>
            <div
              className={`ad-crop-frame ad-picker-preview${round ? ' ad-crop-frame--round' : ''}`}
              style={ratio ? frameFor(ratio) : undefined}
            >
              <img src={mediaUrl(result)} alt="" className={ratio ? 'is-cover' : 'is-contain'} />
              {overlay && <div className="ad-crop-overlay" aria-hidden="true">{overlay}</div>}
            </div>
            <div className="ad-row ad-crop-actions">
              <button type="button" className="ad-btn ad-btn--ghost" onClick={() => setStep(ratio ? 'crop' : 'library')}>{ratio ? 'Back to crop' : 'Back to photos'}</button>
              <button type="button" className="ad-btn" onClick={() => onPick(result)}>Use this photo</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// One photo field: shows the photo, and opens the library picker to choose, crop and
// preview a new one. With a ratio, the photo is cropped to that shape.
export function PhotoField({ label = 'Photo', hint, value, onChange, ratio, round = false, overlay = null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ad-field">
      <span>{label}{hint && <small> — {hint}</small>}</span>
      <div className="ad-photo-field">
        <button
          type="button"
          className={`ad-photo-preview${round ? ' ad-photo-preview--round' : ''}`}
          style={ratio ? { aspectRatio: String(ratio), height: 'auto' } : undefined}
          onClick={() => setOpen(true)}
          title="Choose a photo"
        >
          {value ? <img src={mediaUrl(value)} alt="" /> : <small>No photo</small>}
        </button>
        <div className="ad-stack">
          <div className="ad-row">
            <button type="button" className="ad-btn ad-btn--ghost ad-btn--small" onClick={() => setOpen(true)}>
              <ImagePlus size={14} aria-hidden="true" /> {value ? 'Change photo' : 'Choose photo'}
            </button>
            {value && <button type="button" className="ad-link-text" onClick={() => onChange('')}>Remove</button>}
          </div>
          <p className="ad-muted ad-small">Pick from your photo library or upload a new one{ratio ? ', then crop and preview it' : ''}.</p>
        </div>
      </div>
      {open && (
        <PhotoPicker
          ratio={ratio}
          round={round}
          overlay={overlay}
          current={value}
          onClose={() => setOpen(false)}
          onPick={(url) => { setOpen(false); onChange(url); }}
        />
      )}
    </div>
  );
}
