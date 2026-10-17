import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/store';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, { params: { type: 'BUNDLE' } });
        setCollections(res.data);
      } catch (e) {
        console.error('Error fetching collections', e);
        setError('We couldn’t load collections just now. Please try again.');
      }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  return (
    <main className="jayam-shop-page">
      <div className="jayam-shop-intro">
        <p className="jayam-eyebrow">Thoughtfully brought together</p>
        <h1>Curated<br /><em>collections.</em></h1>
        <p>Purposeful pairings for simple, considered wellness rituals.</p>
      </div>
      <div className="jayam-collections-content">
        <header className="mb-10 flex items-center justify-between">
          <p className="text-sm text-brand-dark/65">{loading ? 'Finding your collection…' : `${collections.length} collections`}</p>
          <Link to="/shop" className="text-xs uppercase tracking-widest underline underline-offset-4">Shop everything</Link>
        </header>

        {loading ? (
          <div className="jayam-product-grid">
            {[...Array(2)].map((_, i) => <div key={i} className="jayam-product-skeleton" />)}
          </div>
        ) : error ? (
          <div className="jayam-shop-empty" role="alert">
            <p className="jayam-eyebrow">A moment, please</p>
            <h2>Our collections aren’t loading.</h2>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : collections.length === 0 ? (
          <div className="jayam-shop-empty">
            <p className="jayam-eyebrow">Coming together</p>
            <h2>Our collections are taking shape.</h2>
            <p>Browse our individual wellness essentials in the meantime.</p>
            <Link to="/shop">Explore the shop <span aria-hidden="true">↗</span></Link>
          </div>
        ) : (
          <div className="jayam-collection-grid">
            {collections.map(collection => (
              <Link to={`/products/${collection.slug}`} key={collection.id} className="group block">
                <div className="jayam-collection-image">
                  {collection.images?.[0] ? (
                    <img src={collection.images[0].url} alt={collection.images[0].altText || collection.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="jayam-product-placeholder" aria-hidden="true">J</div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-serif text-brand-forest-700 mb-2">{collection.name}</h2>
                    {collection.relatedTo?.length > 0 && (
                      <p className="text-sm text-brand-forest-700/60 mb-3">Includes {collection.relatedTo.length} products</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-light text-brand-forest-700">{formatPrice(collection.price)}</span>
                    {collection.compareAtPrice && collection.compareAtPrice > collection.price && (
                      <div className="text-sm text-brand-forest-700/50 line-through">{formatPrice(collection.compareAtPrice)}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
