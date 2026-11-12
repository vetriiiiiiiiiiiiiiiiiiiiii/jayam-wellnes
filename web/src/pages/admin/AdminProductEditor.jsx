import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, ImagePlus, Trash2 } from 'lucide-react';
import { adminApi, mediaUrl } from '../../lib/adminApi';
import { formatPrice } from '../../lib/store';
import { ListEditor, PhotoField, useNotice } from './adminBits';
import ProductStoryEditor, { storyForEditing } from './ProductStoryEditor';

const MAX_PHOTOS = 20;

const EMPTY = {
  name: '', tagline: '', category: 'Herbal Supplements', productType: 'SUPPLEMENT',
  price: '', compareAtPrice: '', stockQuantity: '0', isPublished: false,
  shortDescription: '', description: '', ingredients: '', usageInstructions: '', warnings: '', disclaimer: '',
  highlights: [], specs: [],
  story: storyForEditing(null),
  offer: { active: false, type: 'PERCENT', value: '', label: '', startsAt: '', endsAt: '' },
};

// Offer dates are whole days in the admin's own time zone
const dayOf = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const offerFromProduct = (offer) => (offer && typeof offer === 'object' ? {
  active: Boolean(offer.active),
  type: offer.type === 'FIXED' ? 'FIXED' : 'PERCENT',
  value: offer.value ? String(offer.value) : '',
  label: offer.label || '',
  startsAt: dayOf(offer.startsAt),
  endsAt: dayOf(offer.endsAt),
} : EMPTY.offer);

const offerForSaving = (offer) => ({
  ...offer,
  startsAt: offer.startsAt ? new Date(`${offer.startsAt}T00:00:00`).toISOString() : null,
  endsAt: offer.endsAt ? new Date(`${offer.endsAt}T23:59:59`).toISOString() : null,
});

// The offer as the shop will show it right now
const offerStatus = (offer) => {
  if (!offer.active) return ['Off', 'grey'];
  const today = dayOf(new Date());
  if (offer.endsAt && offer.endsAt < today) return ['Ended', 'grey'];
  if (offer.startsAt && offer.startsAt > today) return ['Scheduled', 'blue'];
  return ['Live', 'green'];
};

// The words that sit over a shop box photo, for the crop frame and the preview
function TileWords({ values }) {
  const name = (values.name || 'Product name').replace(/^Organic\s+/i, '').split(' — ')[0];
  const price = Number(values.price);
  return (
    <div className="ad-tile-words">
      <small>{values.category || 'Wellness'}</small>
      <b>{name}</b>
      {values.tagline && <span>{values.tagline}</span>}
      <div><i>Learn more</i><i className="is-buy">Buy</i></div>
      {price > 0 && <small>{formatPrice(price)}</small>}
    </div>
  );
}

function OfferCard({ offer, price, onChange }) {
  const set = (key) => (event) => onChange({ ...offer, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  const base = Number(price);
  const value = Number(offer.value);
  const salePrice = Number.isFinite(base) && base > 0 && value > 0
    ? Math.max(0.01, Math.round((offer.type === 'PERCENT' ? base * (1 - value / 100) : base - value) * 100) / 100)
    : null;
  const [status, tone] = offerStatus(offer);
  return (
    <section className="ad-card">
      <div className="ad-card-head">
        <h2>Offer</h2>
        <span className={`ad-badge ad-badge--${tone}`}>{status}</span>
      </div>
      <p className="ad-muted ad-small">A limited-time price for this product only. The shop shows the offer price with the old price crossed out, and checkout charges the offer price.</p>
      <label className="ad-check">
        <input type="checkbox" checked={offer.active} onChange={set('active')} />
        <span><b>Run an offer</b><small>Turn off to end it early</small></span>
      </label>
      <div className="ad-field-row">
        <label className="ad-field">Type
          <select value={offer.type} onChange={set('type')}>
            <option value="PERCENT">Percentage off</option>
            <option value="FIXED">Dollars off</option>
          </select>
        </label>
        <label className="ad-field">{offer.type === 'PERCENT' ? 'Percent' : 'Dollars'}
          <input type="number" min="0.01" max={offer.type === 'PERCENT' ? 99 : undefined} step="0.01" value={offer.value} onChange={set('value')} required={offer.active} />
        </label>
      </div>
      <label className="ad-field">Offer name <small>(optional, shown on the badge, e.g. Diwali offer)</small>
        <input value={offer.label} onChange={set('label')} maxLength={60} placeholder="e.g. Launch offer" />
      </label>
      <div className="ad-field-row">
        <label className="ad-field">Starts <small>(optional)</small><input type="date" value={offer.startsAt} onChange={set('startsAt')} /></label>
        <label className="ad-field">Ends <small>(optional)</small><input type="date" value={offer.endsAt} onChange={set('endsAt')} /></label>
      </div>
      {salePrice != null && (
        <p className="ad-offer-preview">
          Shop price: <b>{formatPrice(salePrice)}</b> <s>{formatPrice(base)}</s>
          {offer.type === 'PERCENT' ? ` · ${value}% off` : ` · ${formatPrice(value)} off`}
        </p>
      )}
    </section>
  );
}

const fromProduct = (product) => ({
  ...EMPTY,
  ...Object.fromEntries(Object.keys(EMPTY).map((key) => [key, product[key] ?? EMPTY[key]])),
  price: String(product.price ?? ''),
  compareAtPrice: product.compareAtPrice == null ? '' : String(product.compareAtPrice),
  stockQuantity: String(product.stockQuantity ?? 0),
  highlights: Array.isArray(product.highlights) ? product.highlights : [],
  specs: (product.specs || []).map(({ name, value }) => ({ name, value })),
  story: storyForEditing(product),
  offer: offerFromProduct(product.offer),
});

export default function AdminProductEditor() {
  const { id } = useParams();
  const creating = id === 'new';
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]); // existing: { id, url }
  const [newFiles, setNewFiles] = useState([]); // { file, preview }
  const [loading, setLoading] = useState(!creating);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, notify] = useNotice();

  useEffect(() => {
    if (creating) return;
    adminApi.products().then((result) => {
      const found = result.ok && result.data.find((item) => item.id === id);
      if (!found) setError(result.ok ? 'Product not found' : result.message);
      else {
        setProduct(found);
        setValues(fromProduct(found));
        setImages(found.images || []);
      }
      setLoading(false);
    });
  }, [creating, id]);

  useEffect(() => () => newFiles.forEach(({ preview }) => URL.revokeObjectURL(preview)), [newFiles]);

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const setList = (key) => (list) => setValues((current) => ({ ...current, [key]: list }));

  const addFiles = (event) => {
    const files = [...event.target.files].slice(0, MAX_PHOTOS - images.length - newFiles.length);
    setNewFiles((current) => [...current, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    event.target.value = '';
  };

  const moveImage = (index, delta) => {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setImages(next);
  };

  const dirtyName = useMemo(() => values.name.trim(), [values.name]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'offer') form.append(key, JSON.stringify(offerForSaving(value)));
      else if (key === 'highlights' || key === 'specs' || key === 'story') form.append(key, JSON.stringify(value));
      else form.append(key, typeof value === 'boolean' ? String(value) : value);
    });
    if (!creating) form.append('keepImageIds', JSON.stringify(images.map((image) => image.id)));
    newFiles.forEach(({ file }) => form.append('images', file));

    const result = creating ? await adminApi.createProduct(form) : await adminApi.updateProduct(id, form);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    const saved = result.data.product;
    setNewFiles([]);
    if (creating) {
      navigate(`/admin/products/${saved.id}`, { replace: true });
    } else {
      setProduct(saved);
      setValues(fromProduct(saved));
      setImages(saved.images || []);
      notify('Product saved');
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${product.name}”? This can’t be undone.`)) return;
    const result = await adminApi.deleteProduct(id);
    if (!result.ok) return notify(result.message, 'error');
    if (result.data.archived) {
      notify(result.data.message);
      setValues((current) => ({ ...current, isPublished: false }));
      return;
    }
    navigate('/admin/products', { replace: true });
  };

  if (loading) return <p className="ad-muted">Loading the product…</p>;
  if (error && !creating && !product) return <p className="ad-error">{error}</p>;

  return (
    <form className="ad-page" onSubmit={save}>
      {notice}
      <div className="ad-head">
        <div>
          <Link to="/admin/products" className="ad-link-text"><ArrowLeft size={14} aria-hidden="true" /> Products</Link>
          <h1>{creating ? 'New product' : dirtyName || 'Product'}</h1>
        </div>
        <div className="ad-row">
          {product?.slug && product.isPublished && (
            <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="ad-btn ad-btn--ghost">View in shop <ExternalLink size={14} aria-hidden="true" /></a>
          )}
          <button type="submit" className="ad-btn" disabled={saving}>{saving ? 'Saving…' : creating ? 'Create product' : 'Save changes'}</button>
        </div>
      </div>
      {error && <p className="ad-error">{error}</p>}

      <div className="ad-editor">
        <div className="ad-stack">
          <section className="ad-card">
            <h2>Basics</h2>
            <label className="ad-field">Name<input value={values.name} onChange={set('name')} required maxLength={160} /></label>
            <label className="ad-field">Tagline <small>— the short line under the name, e.g. “Nature’s Everyday Superfood”</small><input value={values.tagline} onChange={set('tagline')} maxLength={160} /></label>
            <label className="ad-field">Short description <small>— shown beside the Add to bag button</small><textarea rows={3} value={values.shortDescription} onChange={set('shortDescription')} /></label>
            <label className="ad-field">Full description <small>— separate paragraphs with a blank line</small><textarea rows={8} value={values.description} onChange={set('description')} /></label>
          </section>

          <section className="ad-card">
            <h2>Highlights and specifications</h2>
            <PhotoField
              label="PNG for the white space beside box 1"
              hint="a picture with no background, e.g. the pack; click Save changes after uploading"
              value={values.story.featuresImage}
              onChange={(featuresImage) => setValues((current) => ({ ...current, story: { ...current.story, featuresImage } }))}
            />
            <ListEditor
              label="Highlights — the feature tiles on the product page"
              items={values.highlights}
              onChange={setList('highlights')}
              fields={[{ key: 'title', placeholder: 'Title' }, { key: 'body', placeholder: 'Text — keep the * on benefit claims', long: true }, { key: 'image', placeholder: 'Photo in the box', photo: true }]}
              addLabel="Add a highlight"
            />
            <ListEditor
              label="Specifications"
              items={values.specs}
              onChange={setList('specs')}
              fields={[{ key: 'name', placeholder: 'Name, e.g. Contents' }, { key: 'value', placeholder: 'Value, e.g. 120 capsules · 2-month supply' }]}
              addLabel="Add a specification"
            />
          </section>

          <ProductStoryEditor story={values.story} onChange={(story) => setValues((current) => ({ ...current, story }))} />

          <section className="ad-card">
            <h2>Ingredients, use and safety</h2>
            <label className="ad-field">Ingredients<textarea rows={3} value={values.ingredients} onChange={set('ingredients')} /></label>
            <label className="ad-field">How to use<textarea rows={3} value={values.usageInstructions} onChange={set('usageInstructions')} /></label>
            <label className="ad-field">Warnings &amp; precautions<textarea rows={3} value={values.warnings} onChange={set('warnings')} /></label>
            <label className="ad-field">Disclaimer<textarea rows={2} value={values.disclaimer} onChange={set('disclaimer')} /></label>
          </section>
        </div>

        <div className="ad-stack">
          <section className="ad-card">
            <h2>Visibility</h2>
            <label className="ad-check">
              <input type="checkbox" checked={values.isPublished} onChange={set('isPublished')} />
              <span><b>Published</b><small>Show this product in the shop</small></span>
            </label>
          </section>

          <section className="ad-card">
            <h2>Price and stock</h2>
            <div className="ad-field-row">
              <label className="ad-field">Price (USD)<input type="number" min="0" step="0.01" value={values.price} onChange={set('price')} required /></label>
              <label className="ad-field">Compare-at <small>(optional)</small><input type="number" min="0" step="0.01" value={values.compareAtPrice} onChange={set('compareAtPrice')} /></label>
            </div>
            <label className="ad-field">In stock<input type="number" min="0" step="1" value={values.stockQuantity} onChange={set('stockQuantity')} /></label>
          </section>

          <OfferCard offer={values.offer} price={values.price} onChange={(offer) => setValues((current) => ({ ...current, offer }))} />

          <section className="ad-card">
            <h2>Organisation</h2>
            <label className="ad-field">Type
              <select value={values.productType || 'SUPPLEMENT'} onChange={set('productType')}>
                <option value="SUPPLEMENT">Supplement</option>
                <option value="SKINCARE">Skincare</option>
                <option value="BUNDLE">Bundle</option>
              </select>
            </label>
            <label className="ad-field">Category<input value={values.category || ''} onChange={set('category')} placeholder="e.g. Herbal Supplements" /></label>
          </section>

          <section className="ad-card">
            <h2>Shop box photo</h2>
            <p className="ad-muted ad-small">Fills the product’s box in the shop and under “more products”. Choose any photo: you can zoom and move it in the square, with the box’s words shown on top so you can keep the product clear of them. Without one, the box uses the product’s first photo.</p>
            <PhotoField
              label="Box photo"
              hint="square; cropped when you choose it"
              ratio={1}
              overlay={<TileWords values={values} />}
              value={values.story.tileImage}
              onChange={(tileImage) => setValues((current) => ({ ...current, story: { ...current.story, tileImage } }))}
            />
            {(values.story.tileImage || images[0]?.url) && (
              <div className="ad-field">
                <span>Preview <small>— how the box looks in the shop</small></span>
                <div className="ad-tile-preview">
                  <img src={mediaUrl(values.story.tileImage || images[0]?.url)} alt="" />
                  <div className="ad-crop-overlay"><TileWords values={values} /></div>
                </div>
              </div>
            )}
          </section>

          <section className="ad-card">
            <h2>Photos</h2>
            <p className="ad-muted ad-small">Add up to {MAX_PHOTOS}; you can select several at once. The first photo is the main one on the home page and in the shop. All of them show in the gallery in the product page’s buy section. Without photos, the site shows the illustrated Jayam pack.</p>
            <p className="ad-tip"><b>Tip:</b> for the home page, use a cut-out PNG of the pack with a transparent background, roughly portrait (about 4:5). It stands on the page with the same soft shadow as the illustrations.</p>
            <div className="ad-images">
              {images.map((image, index) => (
                <figure key={image.id} className="ad-image">
                  <img src={mediaUrl(image.url)} alt="" />
                  {index === 0 && <span className="ad-image-tag">Main</span>}
                  <div className="ad-image-actions">
                    <button type="button" className="ad-icon-btn" disabled={index === 0} onClick={() => moveImage(index, -1)} aria-label="Move earlier"><ArrowUp size={14} /></button>
                    <button type="button" className="ad-icon-btn" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} aria-label="Move later"><ArrowDown size={14} /></button>
                    <button type="button" className="ad-icon-btn ad-icon-btn--danger" onClick={() => setImages(images.filter((item) => item.id !== image.id))} aria-label="Remove photo"><Trash2 size={14} /></button>
                  </div>
                </figure>
              ))}
              {newFiles.map(({ file, preview }) => (
                <figure key={preview} className="ad-image ad-image--new">
                  <img src={preview} alt="" />
                  <span className="ad-image-tag">New</span>
                  <div className="ad-image-actions">
                    <button type="button" className="ad-icon-btn ad-icon-btn--danger" onClick={() => setNewFiles(newFiles.filter((item) => item.file !== file))} aria-label="Remove photo"><Trash2 size={14} /></button>
                  </div>
                </figure>
              ))}
              {images.length + newFiles.length < MAX_PHOTOS && (
                <button type="button" className="ad-image-add" onClick={() => fileInput.current?.click()}>
                  <ImagePlus size={22} aria-hidden="true" />
                  Add photos
                </button>
              )}
            </div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={addFiles} />
            <p className="ad-muted ad-small">JPEG, PNG, WebP or AVIF, up to 20 MB each. Photos are resized and saved when you save the product.</p>
          </section>

          {!creating && (
            <section className="ad-card ad-danger-zone">
              <h2>Delete product</h2>
              <p className="ad-muted ad-small">Products that already appear in orders are unpublished instead, so order history stays complete.</p>
              <button type="button" className="ad-btn ad-btn--danger" onClick={remove}>Delete product</button>
            </section>
          )}
        </div>
      </div>
    </form>
  );
}
