import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminApi, formatDateTime } from '../../lib/adminApi';
import { formatPrice } from '../../lib/store';
import { Drawer, useNotice } from './adminBits';

// Discount codes customers type at checkout. Uses are counted once an order is paid.

const EMPTY = { code: '', type: 'PERCENT', value: '', minSubtotal: '', maxUses: '', startsAt: '', endsAt: '', active: true, productIds: [] };

const toInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const describe = (discount) => (discount.type === 'PERCENT' ? `${discount.value}% off` : `${formatPrice(discount.value)} off`);

const statusOf = (discount) => {
  const now = Date.now();
  if (!discount.active) return ['Off', 'grey'];
  if (discount.endsAt && new Date(discount.endsAt) < now) return ['Expired', 'grey'];
  if (discount.startsAt && new Date(discount.startsAt) > now) return ['Scheduled', 'blue'];
  if (discount.maxUses != null && discount.usedCount >= discount.maxUses) return ['Used up', 'grey'];
  return ['Active', 'green'];
};

function DiscountForm({ discount, products, onSaved, onDeleted, notify }) {
  const [values, setValues] = useState(discount ? {
    ...discount,
    value: String(discount.value),
    minSubtotal: discount.minSubtotal ? String(discount.minSubtotal) : '',
    maxUses: discount.maxUses == null ? '' : String(discount.maxUses),
    startsAt: toInput(discount.startsAt),
    endsAt: toInput(discount.endsAt),
    productIds: discount.productIds || [],
  } : EMPTY);
  const [scope, setScope] = useState(discount?.productIds?.length ? 'products' : 'all');
  const toggleProduct = (productId) => setValues((current) => ({
    ...current,
    productIds: current.productIds.includes(productId) ? current.productIds.filter((item) => item !== productId) : [...current.productIds, productId],
  }));
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    if (scope === 'products' && values.productIds.length === 0) return notify('Choose at least one product, or let the code work on the whole order', 'error');
    setBusy(true);
    // Dates are whole days: a code starts at the beginning of its first day and ends after its last
    const result = await adminApi.saveDiscount(discount?.id, {
      ...values,
      productIds: scope === 'products' ? values.productIds : [],
      startsAt: values.startsAt ? `${values.startsAt}T00:00:00` : null,
      endsAt: values.endsAt ? `${values.endsAt}T23:59:59` : null,
    });
    setBusy(false);
    if (!result.ok) return notify(result.message, 'error');
    notify(discount ? 'Discount saved' : `Code ${result.data.code} created`);
    onSaved();
  };

  const remove = async () => {
    if (!window.confirm(`Delete the code ${discount.code}? Past orders keep their discount.`)) return;
    const result = await adminApi.deleteDiscount(discount.id);
    if (!result.ok) return notify(result.message, 'error');
    notify('Discount deleted');
    onDeleted();
  };

  return (
    <form className="ad-detail" onSubmit={save}>
      <label className="ad-field">Code <small>— what customers type, e.g. WELCOME10</small>
        <input value={values.code} onChange={set('code')} required maxLength={32} style={{ textTransform: 'uppercase' }} />
      </label>
      <div className="ad-field-row">
        <label className="ad-field">Type
          <select value={values.type} onChange={set('type')}>
            <option value="PERCENT">Percentage off</option>
            <option value="FIXED">Dollars off</option>
          </select>
        </label>
        <label className="ad-field">{values.type === 'PERCENT' ? 'Percent' : 'Dollars'}
          <input type="number" min="0.01" max={values.type === 'PERCENT' ? 100 : undefined} step="0.01" value={values.value} onChange={set('value')} required />
        </label>
      </div>
      <div className="ad-field">
        <span>Works on</span>
        <div className="ad-row">
          <label className="ad-check ad-check--inline"><input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} /><span><b>The whole order</b></span></label>
          <label className="ad-check ad-check--inline"><input type="radio" name="scope" checked={scope === 'products'} onChange={() => setScope('products')} /><span><b>Chosen products only</b></span></label>
        </div>
        {scope === 'products' && (
          <div className="ad-product-picks">
            {!products ? <small className="ad-muted">Loading products…</small> : products.map((product) => (
              <label key={product.id}>
                <input type="checkbox" checked={values.productIds.includes(product.id)} onChange={() => toggleProduct(product.id)} />
                {product.name}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="ad-field-row">
        <label className="ad-field">Minimum subtotal <small>(optional)</small>
          <input type="number" min="0" step="0.01" value={values.minSubtotal} onChange={set('minSubtotal')} placeholder="None" />
        </label>
        <label className="ad-field">Use limit <small>(optional)</small>
          <input type="number" min="1" step="1" value={values.maxUses} onChange={set('maxUses')} placeholder="Unlimited" />
        </label>
      </div>
      <div className="ad-field-row">
        <label className="ad-field">Starts <small>(optional)</small><input type="date" value={values.startsAt} onChange={set('startsAt')} /></label>
        <label className="ad-field">Ends <small>(optional)</small><input type="date" value={values.endsAt} onChange={set('endsAt')} /></label>
      </div>
      <label className="ad-check">
        <input type="checkbox" checked={values.active} onChange={set('active')} />
        <span><b>Active</b><small>Turn off to stop the code working without deleting it</small></span>
      </label>
      <p className="ad-muted ad-small">{scope === 'products' ? 'The discount comes off the chosen products only.' : 'The discount comes off the subtotal.'} Free shipping still uses the subtotal before the discount.</p>
      <div className="ad-row">
        <button type="submit" className="ad-btn" disabled={busy}>{busy ? 'Saving…' : discount ? 'Save changes' : 'Create code'}</button>
        {discount && <button type="button" className="ad-btn ad-btn--danger" onClick={remove}>Delete</button>}
      </div>
    </form>
  );
}

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null); // a discount, or 'new'
  const [notice, notify] = useNotice();
  const [products, setProducts] = useState(null);
  useEffect(() => {
    adminApi.products().then((result) => setProducts(result.ok ? result.data : []));
  }, []);
  const productNames = Object.fromEntries((products || []).map((product) => [product.id, product.name.replace(/^Organic\s+/i, '').split(' — ')[0]]));

  const load = useCallback(() => {
    adminApi.discounts().then((result) => (result.ok ? setDiscounts(result.data) : setError(result.message)));
  }, []);
  useEffect(load, [load]);

  const done = () => {
    setOpen(null);
    load();
  };

  if (error) return <p className="ad-error">{error}</p>;

  return (
    <div className="ad-page">
      {notice}
      <div className="ad-head">
        <div>
          <h1>Discounts</h1>
          <p className="ad-muted">Codes customers enter at checkout.</p>
        </div>
        <button type="button" className="ad-btn" onClick={() => setOpen('new')}><Plus size={16} aria-hidden="true" /> New code</button>
      </div>

      <section className="ad-card ad-card--flush">
        {!discounts ? (
          <p className="ad-muted ad-pad">Loading discount codes…</p>
        ) : discounts.length === 0 ? (
          <p className="ad-muted ad-pad">No codes yet. Create one, for example WELCOME10 for 10% off.</p>
        ) : (
          <table className="ad-table ad-table--click">
            <thead><tr><th>Code</th><th>Discount</th><th>Used</th><th>Status</th><th>Ends</th></tr></thead>
            <tbody>
              {discounts.map((discount) => {
                const [label, tone] = statusOf(discount);
                return (
                  <tr key={discount.id} onClick={() => setOpen(discount)} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && setOpen(discount)}>
                    <td><b>{discount.code}</b>{discount.minSubtotal > 0 && <small>Orders over {formatPrice(discount.minSubtotal)}</small>}</td>
                    <td>{describe(discount)}{discount.productIds?.length > 0 && <small>On {discount.productIds.map((productId) => productNames[productId] || 'a removed product').join(', ')}</small>}</td>
                    <td>{discount.usedCount}{discount.maxUses != null ? ` / ${discount.maxUses}` : ''}</td>
                    <td><span className={`ad-badge ad-badge--${tone}`}>{label}</span></td>
                    <td>{discount.endsAt ? formatDateTime(discount.endsAt) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {open && (
        <Drawer title={open === 'new' ? 'New discount code' : open.code} onClose={() => setOpen(null)}>
          <DiscountForm key={open === 'new' ? 'new' : open.id} discount={open === 'new' ? null : open} products={products} onSaved={done} onDeleted={done} notify={notify} />
        </Drawer>
      )}
    </div>
  );
}
