import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { adminApi, mediaUrl } from '../../lib/adminApi';
import { AssetGrid, uploadToLibrary, useNotice } from './adminBits';

// Admin → Assets: every photo uploaded to the store, in one place. Photos chosen in any
// photo field come from here, and new uploads and crops land here too.

export default function AdminAssets() {
  const [assets, setAssets] = useState(null);
  const [filter, setFilter] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [notice, notify] = useNotice();
  const input = useRef(null);

  const [loadError, setLoadError] = useState('');
  const load = useCallback(() => {
    adminApi.assets().then((result) => {
      if (!result.ok) return setLoadError(result.message);
      setAssets(result.data.assets);
      setNote(result.data.note || '');
    });
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!viewing) return undefined;
    const onKey = (event) => event.key === 'Escape' && setViewing(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewing]);

  const upload = async (event) => {
    const files = [...event.target.files];
    event.target.value = '';
    if (!files.length) return;
    setBusy(true);
    const { urls, error } = await uploadToLibrary(files);
    setBusy(false);
    if (error) notify(error, 'error');
    else notify(urls.length === 1 ? 'Photo added' : `${urls.length} photos added`);
    load();
  };

  const remove = async (asset) => {
    if (!window.confirm('Delete this photo from the library? This cannot be undone.')) return;
    const result = await adminApi.deleteAsset(asset.url);
    if (!result.ok) return notify(result.message, 'error');
    notify('Photo deleted');
    setViewing(null);
    load();
  };

  const shown = !assets ? null : filter === 'unused' ? assets.filter((asset) => !asset.inUse) : assets;
  const unused = assets ? assets.filter((asset) => !asset.inUse).length : 0;

  return (
    <div className="ad-page">
      {notice}
      <div className="ad-head">
        <div>
          <h1>Assets</h1>
          <p className="ad-muted">All your photos. Every photo field in the admin lets you pick from here, crop it to fit and preview it.</p>
        </div>
        <button type="button" className="ad-btn" onClick={() => input.current?.click()} disabled={busy}>
          <ImagePlus size={16} aria-hidden="true" /> {busy ? 'Uploading…' : 'Upload photos'}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden multiple onChange={upload} />
      </div>

      {loadError && <p className="ad-error">{loadError}</p>}
      {note && <p className="ad-muted ad-small">{note}</p>}

      <section className="ad-card">
        <div className="ad-row ad-assets-filter">
          <button type="button" className={`ad-chip${filter === 'all' ? ' is-on' : ''}`} onClick={() => setFilter('all')}>All {assets ? `(${assets.length})` : ''}</button>
          <button type="button" className={`ad-chip${filter === 'unused' ? ' is-on' : ''}`} onClick={() => setFilter('unused')}>Not used on the site ({unused})</button>
        </div>
        <AssetGrid
          assets={shown}
          onSelect={setViewing}
          renderActions={(asset) => (
            <button
              type="button"
              className="ad-icon-btn ad-icon-btn--danger"
              onClick={() => remove(asset)}
              disabled={asset.inUse}
              title={asset.inUse ? 'Used on the site; replace it there before deleting' : 'Delete'}
              aria-label="Delete photo"
            >
              <Trash2 size={15} />
            </button>
          )}
        />
      </section>

      {viewing && (
        <div className="ad-crop-wrap" role="dialog" aria-modal="true" aria-label="Photo preview">
          <button type="button" className="ad-drawer-scrim" aria-label="Close" onClick={() => setViewing(null)} />
          <div className="ad-crop ad-asset-view">
            <div className="ad-picker-head">
              <h2>Preview</h2>
              <button type="button" className="ad-icon-btn" onClick={() => setViewing(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <img src={mediaUrl(viewing.url)} alt="" />
            <p className="ad-muted ad-small">
              {viewing.inUse ? 'Used on the site.' : 'Not used on the site.'} Uploaded {new Date(viewing.createdAt).toLocaleString()}.
            </p>
            <div className="ad-row ad-crop-actions">
              <a className="ad-btn ad-btn--ghost" href={mediaUrl(viewing.url)} target="_blank" rel="noreferrer">Open full size</a>
              {!viewing.inUse && <button type="button" className="ad-btn ad-btn--danger" onClick={() => remove(viewing)}>Delete</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
