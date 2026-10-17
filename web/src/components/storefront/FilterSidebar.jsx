'use client';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export default function FilterSidebar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentSort = searchParams.get('sort') || '';
  
  const createQueryString = useCallback((name, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  }, [searchParams]);

  const setFilter = (name, value) => {
    navigate('?' + createQueryString(name, value), {
      replace: true
    });
  };

  const handlePriceChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      let qs = createQueryString('minPrice', '');
      const params = new URLSearchParams(qs);
      params.delete('maxPrice');
      navigate('?' + params.toString(), { replace: true });
    } else if (val === '25') {
      let qs = createQueryString('minPrice', '');
      const params = new URLSearchParams(qs);
      params.set('maxPrice', '25');
      navigate('?' + params.toString(), { replace: true });
    } else if (val === '25-32') {
      let qs = createQueryString('minPrice', '25');
      const params = new URLSearchParams(qs);
      params.set('maxPrice', '32');
      navigate('?' + params.toString(), { replace: true });
    } else if (val === '32') {
      let qs = createQueryString('minPrice', '32');
      const params = new URLSearchParams(qs);
      params.delete('maxPrice');
      navigate('?' + params.toString(), { replace: true });
    }
  };

  const currentPriceValue = currentMinPrice === '' && currentMaxPrice === '25' ? '25' :
                            currentMinPrice === '25' && currentMaxPrice === '32' ? '25-32' :
                            currentMinPrice === '32' && currentMaxPrice === '' ? '32' : '';

  return (
    <div className="space-y-8 pr-4">
      <div>
        <h3 className="text-lg font-serif text-brand-dark mb-4">Sort By</h3>
        <select 
          value={currentSort} 
          onChange={(e) => setFilter('sort', e.target.value)}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-brand-dark/80 focus:ring-brand-green-500 focus:border-brand-green-500 outline-none shadow-sm transition-shadow hover:shadow"
        >
          <option value="">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="h-px bg-gray-200 w-full" />

      <div>
        <h3 className="text-lg font-serif text-brand-dark mb-4">Price Range</h3>
        <select 
          value={currentPriceValue} 
          onChange={handlePriceChange}
          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-brand-dark/80 focus:ring-brand-green-500 focus:border-brand-green-500 outline-none shadow-sm transition-shadow hover:shadow"
        >
          <option value="">All Prices</option>
          <option value="25">Under $25</option>
          <option value="25-32">$25 – $32</option>
          <option value="32">$32 &amp; above</option>
        </select>
      </div>
      
      {(currentMinPrice || currentMaxPrice || currentSort) && (
        <button 
          onClick={() => navigate('?', { replace: true })} 
          className="text-xs uppercase tracking-widest text-brand-green-500 hover:text-brand-green-700 transition-colors mt-4 block font-semibold"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}