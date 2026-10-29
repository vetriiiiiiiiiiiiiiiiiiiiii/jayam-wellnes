import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProductArt from '../../components/storefront/ProductArt';
import { adminApi, mediaUrl } from '../../lib/adminApi';
import { formatPrice } from '../../lib/store';

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.products().then((result) => (result.ok ? setProducts(result.data) : setError(result.message)));
  }, []);

  if (error) return <p className="ad-error">{error}</p>;

  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Products</h1>
          <p className="ad-muted">Everything shown in the shop. Unpublished products are hidden from customers.</p>
        </div>
        <Link to="/admin/products/new" className="ad-btn"><Plus size={16} aria-hidden="true" /> New product</Link>
      </div>

      <section className="ad-card ad-card--flush">
        {!products ? (
          <p className="ad-muted ad-pad">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="ad-muted ad-pad">No products yet. Add the first one.</p>
        ) : (
          <table className="ad-table">
            <thead><tr><th>Product</th><th>Type</th><th className="ad-num">Price</th><th className="ad-num">Stock</th><th>Status</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link to={`/admin/products/${product.id}`} className="ad-product-cell">
                      <span className="ad-thumb">
                        {product.images?.[0]?.url ? <img src={mediaUrl(product.images[0].url)} alt="" /> : <ProductArt product={product} />}
                      </span>
                      <span><b>{product.name}</b><small>{product.tagline || product.slug}</small></span>
                    </Link>
                  </td>
                  <td>{product.category || product.productType || '—'}</td>
                  <td className="ad-num">{formatPrice(product.price)}</td>
                  <td className="ad-num">
                    <span className={product.stockQuantity === 0 ? 'ad-text-red' : product.stockQuantity < 10 ? 'ad-text-amber' : ''}>{product.stockQuantity}</span>
                  </td>
                  <td>{product.isPublished ? <span className="ad-badge ad-badge--green">Published</span> : <span className="ad-badge ad-badge--grey">Hidden</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
