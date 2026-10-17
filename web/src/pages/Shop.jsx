import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/storefront/ProductCard';
import FilterSidebar from '../components/storefront/FilterSidebar';
import { CATEGORY_LABELS } from '../lib/store';
import MoringaSprig from '../components/home/MoringaSprig';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (searchParams.get('minPrice')) params.minPrice = searchParams.get('minPrice');
        if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice');
        if (searchParams.get('sort')) params.sort = searchParams.get('sort');
        if (searchParams.get('search')) params.search = searchParams.get('search');
        if (searchParams.get('type')) params.type = searchParams.get('type');

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, { params });
        if (!Array.isArray(response.data)) throw new Error('The product catalogue returned an invalid response.');
        setProducts(response.data);
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

  const categories = [...new Set(products.map(({ productType }) => productType).filter(Boolean))];
  const categoryLabels = CATEGORY_LABELS;

  return (
    <main className="jayam-shop-page">
      <header className="jayam-shop-intro wl-page-head">
        <MoringaSprig className="wl-page-sprig" pairs={9} />
        <p className="jayam-eyebrow">Thoughtful wellness, made simple</p>
        <h1>Shop the<br /><em>collection.</em></h1>
        <p>Simple, clean, plant-based wellness — carefully selected ingredients, nothing unnecessary. Free U.S. shipping on orders $49 and above.</p>
      </header>
      <section className="jayam-shop-content" aria-label="Product catalogue">
        <div className="jayam-shop-toolbar">
          <div className="jayam-category-filters" aria-label="Filter by category">
            <button type="button" className={!searchParams.get('type') ? 'is-active' : ''} onClick={() => { const next = new URLSearchParams(searchParams); next.delete('type'); setSearchParams(next); }}>Everything</button>
            {categories.map((category) => (
              <button key={category} type="button" className={searchParams.get('type') === category ? 'is-active' : ''} onClick={() => { const next = new URLSearchParams(searchParams); next.set('type', category); setSearchParams(next); }}>
                {categoryLabels[category] || category}
              </button>
            ))}
          </div>
          <div className="jayam-shop-sort">
            <FilterSidebar />
          </div>
          <p aria-live="polite">{loading ? 'Loading products…' : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}</p>
        </div>
        {loading ? (
          <div className="jayam-product-grid" aria-label="Loading products">
            {[...Array(4)].map((_, index) => <div key={index} className="jayam-product-skeleton" />)}
          </div>
        ) : error ? (
          <div className="jayam-shop-empty">
            <p className="jayam-eyebrow">A moment, please</p>
            <h2>Our shelves aren’t loading.</h2>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : products.length ? (
          <div className="jayam-product-grid">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="jayam-shop-empty">
            <p className="jayam-eyebrow">Made with care</p>
            <h2>{searchParams.get('search') || searchParams.get('type') ? 'Nothing in this selection just yet.' : 'Our collection is taking shape.'}</h2>
            <p>{searchParams.get('search') || searchParams.get('type') ? 'Try another category or clear your search.' : 'We’re preparing thoughtful wellness essentials for you. Please check back soon.'}</p>
            {(searchParams.get('search') || searchParams.get('type')) && <button type="button" onClick={() => setSearchParams({})}>View everything</button>}
          </div>
        )}
      </section>
    </main>
  );
}
