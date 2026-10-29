import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Leaf, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import ProductCard, { curated, shortName } from '../components/storefront/ProductCard';
import ProductArt from '../components/storefront/ProductArt';
import FilterSidebar from '../components/storefront/FilterSidebar';
import PageHead from '../components/storefront/PageHead';
import { CATEGORY_LABELS, FREE_SHIPPING_THRESHOLD } from '../lib/store';
import usePageMeta from '../lib/usePageMeta';

const DIFFERENCE = [
  { icon: Truck, tone: 'fern', title: 'Free U.S. shipping', body: `On every order of $${FREE_SHIPPING_THRESHOLD} and above. Delivered in 2–7 business days.` },
  { icon: Leaf, tone: 'wheat', title: 'Organic and plant-based', body: 'Vegan and Non-GMO, with no fillers, binders or artificial colors.' },
  { icon: ShieldCheck, tone: 'earth', title: 'Third-party tested', body: 'Made in GMP-certified facilities and tested for purity and potency.' },
  { icon: MessageCircle, tone: 'cherry', title: 'Real people, quick replies', body: 'Questions about an ingredient or an order? We reply within 1 business day.' },
];

export default function ShopPage() {
  usePageMeta({ title: 'Shop', description: 'Shop organic Moringa leaf, flower and seed supplements and Beauty Drops facial oil. Vegan, Non-GMO, third-party tested. Free U.S. shipping on orders $49+.' });
  const [products, setProducts] = useState([]);
  const [lineup, setLineup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search');
  const type = searchParams.get('type');

  // The full lineup for the product strip, independent of filters
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then(({ data }) => Array.isArray(data) && setLineup(curated(data)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        ['minPrice', 'maxPrice', 'sort', 'search', 'type'].forEach((key) => {
          if (searchParams.get(key)) params[key] = searchParams.get(key);
        });
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, { params });
        if (!Array.isArray(response.data)) throw new Error('The product catalogue returned an invalid response.');
        // Price sorting comes from the API; otherwise show the curated order
        setProducts(params.sort ? response.data : curated(response.data));
      } catch (error) {
        console.error('Error fetching products', error);
        setError('We couldn’t load the catalogue just now. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const categories = [...new Set(lineup.map(({ productType }) => productType).filter(Boolean))];

  const setType = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('type', value);
    else next.delete('type');
    setSearchParams(next);
  };

  return (
    <main className="pg sh">
      <PageHead
        eyebrow="Shop"
        title="All of Jayam."
        accent="Nothing unnecessary."
        sub={`Five plant-based essentials, made with care. Free U.S. shipping on orders $${FREE_SHIPPING_THRESHOLD} and above.`}
      />

      {lineup.length > 0 && (
        <nav className="sh-strip" aria-label="Products">
          {lineup.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="sh-strip-item">
              <span className="sh-strip-art"><ProductArt product={product} /></span>
              <span>{shortName(product)}</span>
            </Link>
          ))}
        </nav>
      )}

      <section className="sh-catalogue" aria-label="Product catalogue">
        <div className="sh-toolbar">
          <div className="pg-chips" aria-label="Filter by category">
            <button type="button" className={!type ? 'is-active' : ''} onClick={() => setType(null)}>All</button>
            {categories.map((category) => (
              <button key={category} type="button" className={type === category ? 'is-active' : ''} onClick={() => setType(category)}>
                {CATEGORY_LABELS[category] || category}
              </button>
            ))}
          </div>
          <FilterSidebar />
        </div>
        <p className="sh-count" aria-live="polite">
          {loading ? 'Loading products…' : `${products.length} ${products.length === 1 ? 'product' : 'products'}${search ? ` for “${search}”` : ''}`}
        </p>

        {loading ? (
          <div className="sh-grid" aria-label="Loading products">
            {[...Array(4)].map((_, index) => <div key={index} className="at at--skeleton" />)}
          </div>
        ) : error ? (
          <div className="pg-empty">
            <h2>Our shelves aren’t loading.</h2>
            <p>{error}</p>
            <button type="button" className="ap-pill" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : products.length ? (
          <div className="sh-grid">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                size={index === 0 && products.length % 2 === 1 ? 'feature' : 'regular'}
              />
            ))}
          </div>
        ) : (
          <div className="pg-empty">
            <h2>{search || type ? 'Nothing in this selection.' : 'Our collection is taking shape.'}</h2>
            <p>{search || type ? 'Try another category or clear your search.' : 'Please check back soon.'}</p>
            {(search || type) && <button type="button" className="ap-pill" onClick={() => setSearchParams({})}>View everything</button>}
          </div>
        )}
      </section>

      <section className="sh-why" aria-labelledby="sh-why-title">
        <h2 id="sh-why-title">The Jayam <em>difference.</em></h2>
        <div className="sh-why-grid">
          {DIFFERENCE.map(({ icon: Icon, tone, title, body }) => (
            <article key={title} className={`sh-why-tile sh-why-tile--${tone}`}>
              <span className="sh-why-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.8} /></span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
