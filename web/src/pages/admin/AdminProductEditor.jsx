import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { adminApi, mediaUrl } from '../../lib/adminApi';
import { useNotice } from './adminBits';

const EMPTY = {
  name: '', tagline: '', category: 'Herbal Supplements', productType: 'SUPPLEMENT',
  price: '', compareAtPrice: '', stockQuantity: '0', isPublished: false,
  shortDescription: '', description: '', ingredients: '', usageInstructions: '', warnings: '', disclaimer: '',
  highlights: [], specs: [],
};

const fromProduct = (product) => ({
  ...EMPTY,
  ...Object.fromEntries(Object.keys(EMPTY).map((key) => [key, product[key] ?? EMPTY[key]])),
  price: String(product.price ?? ''),
  compareAtPrice: product.compareAtPrice == null ? '' : String(product.compareAtPrice),
  stockQuantity: String(product.stockQuantity ?? 0),
  highlights: Array.isArray(product.highlights) ? product.highlights : [],
  specs: (product.specs || []).map(({ name, value }) => ({ name, value })),
});

function ListEditor({ label, items, onChange, fields, addLabel }) {
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
            {fields.map(({ key, placeholder, long }) => (long
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
    const files = [...event.target.files].slice(0, 10 - images.length - newFiles.length);
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
      if (key === 'highlights' || key === 'specs') form.append(key, JSON.stringify(value));
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
            <ListEditor
              label="Highlights — the feature tiles on the product page"
              items={values.highlights}
              onChange={setList('highlights')}
              fields={[{ key: 'title', placeholder: 'Title' }, { key: 'body', placeholder: 'Text — keep the * on benefit claims', long: true }]}
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
            <h2>Photos</h2>
            <p className="ad-muted ad-small">The first photo is the main one — it appears on the home page, in the shop and on the product page. Without photos, the site shows the illustrated Jayam pack.</p>
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
              {images.length + newFiles.length < 10 && (
                <button type="button" className="ad-image-add" onClick={() => fileInput.current?.click()}>
                  <ImagePlus size={22} aria-hidden="true" />
                  Add photos
                </button>
              )}
            </div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={addFiles} />
            <p className="ad-muted ad-small">JPEG, PNG, WebP or AVIF, up to 8 MB each. Photos are resized and saved when you save the product.</p>
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
