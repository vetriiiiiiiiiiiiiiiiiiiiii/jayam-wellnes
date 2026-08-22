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
    } else if (val === '500') {
      let qs = createQueryString('minPrice', '');
      const params = new URLSearchParams(qs);
      params.set('maxPrice', '500');
      navigate('?' + params.toString(), { replace: true });
    } else if (val === '500-1000') {
      let qs = createQueryString('minPrice', '500');
      const params = new URLSearchParams(qs);
      params.set('maxPrice', '1000');
      navigate('?' + params.toString(), { replace: true });
    } else if (val === '1000') {
      let qs = createQueryString('minPrice', '1000');
      const params = new URLSearchParams(qs);
      params.delete('maxPrice');
      navigate('?' + params.toString(), { replace: true });
    }
  };

  const currentPriceValue = currentMinPrice === '' && currentMaxPrice === '500' ? '500' :
                            currentMinPrice === '500' && currentMaxPrice === '1000' ? '500-1000' :
                            currentMinPrice === '1000' && currentMaxPrice === '' ? '1000' : '';

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
          <option value="500">Under ₹500</option>
          <option value="500-1000">₹500 - ₹1000</option>
          <option value="1000">Over ₹1000</option>
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