import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/storefront/ProductCard';
import FilterSidebar from '../components/storefront/FilterSidebar';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchParams.get('minPrice')) params.minPrice = searchParams.get('minPrice');
        if (searchParams.get('maxPrice')) params.maxPrice = searchParams.get('maxPrice');
        if (searchParams.get('sort')) params.sort = searchParams.get('sort');
        if (searchParams.get('search')) params.search = searchParams.get('search');

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, { params });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  // Group products by productType
  const groupedProducts = products.reduce((acc, product) => {
    const type = product.productType || 'OTHER';
    if (!acc[type]) acc[type] = [];
    acc[type].push(product);
    return acc;
  }, {});

  const categoryLabels = {
    'SKINCARE': 'Skincare Essentials',
    'HAIRCARE': 'Haircare Collection',
    'SUPPLEMENT': 'Daily Supplements',
    'BUNDLE': 'Curated Bundles',
    'OTHER': 'Other Products'
  };

  return (
    <main className="min-h-screen bg-brand-pearl pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-16 text-center md:text-left mt-8">
          <h1 className="text-5xl md:text-7xl font-serif text-brand-dark mb-4 tracking-tighter">
            Our Collection
          </h1>
          <p className="text-lg text-brand-dark/70 font-light max-w-xl">
            Discover our full range of scientifically-backed, 100% natural botanical products. Pure power from nature to you.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-12">
          <aside className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-500 font-sans">{products.length} products found</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl aspect-[3/4]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-32 border-2 border-dashed border-brand-green-100 rounded-3xl">
                <p className="text-2xl font-serif text-brand-dark">No products found.</p>
                <p className="text-brand-dark/60 mt-2">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-20">
                {Object.entries(groupedProducts).map(([type, categoryProducts]) => (
                  <div key={type} className="border-t border-gray-200 pt-12 first:border-0 first:pt-0">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-3xl font-serif text-brand-dark">
                        {categoryLabels[type] || type}
                      </h2>
                      <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">{categoryProducts.length} items</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {categoryProducts.map((product, idx) => (
                        <ProductCard key={product.id} product={product} index={idx} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
