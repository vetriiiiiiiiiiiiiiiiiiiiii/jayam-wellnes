'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');
  const currentSort = searchParams.get('sort');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const setFilter = (name: string, value: string) => {
    router.push('?' + createQueryString(name, value), { scroll: false });
  };

  return (
    <div className="space-y-8 pr-4">
      <div>
        <h3 className="text-lg font-serif text-brand-dark mb-4">Sort By</h3>
        <div className="space-y-2">
          {[{ label: 'Newest Arrivals', value: '' }, { label: 'Price: Low to High', value: 'price-asc' }, { label: 'Price: High to Low', value: 'price-desc' }].map((option) => (
            <label key={option.label} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                checked={(currentSort || '') === option.value}
                onChange={() => setFilter('sort', option.value)}
                className="w-4 h-4 text-brand-green-500 bg-brand-pearl border-gray-300 focus:ring-brand-green-500"
              />
              <span className="text-sm font-sans text-brand-dark/70 group-hover:text-brand-dark transition-colors">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200 w-full" />

      <div>
        <h3 className="text-lg font-serif text-brand-dark mb-4">Price Range</h3>
        <div className="space-y-2">
          {[
            { label: 'All Prices', min: '', max: '' },
            { label: 'Under ₹500', min: '', max: '500' },
            { label: '₹500 - ₹1000', min: '500', max: '1000' },
            { label: 'Over ₹1000', min: '1000', max: '' },
          ].map((option, idx) => {
            const isSelected = (currentMinPrice || '') === option.min && (currentMaxPrice || '') === option.max;
            return (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={isSelected}
                  onChange={() => {
                    let qs = createQueryString('minPrice', option.min);
                    const params = new URLSearchParams(qs);
                    if (option.max) {
                      params.set('maxPrice', option.max);
                    } else {
                      params.delete('maxPrice');
                    }
                    router.push('?' + params.toString(), { scroll: false });
                  }}
                  className="w-4 h-4 text-brand-green-500 bg-brand-pearl border-gray-300 focus:ring-brand-green-500"
                />
                <span className="text-sm font-sans text-brand-dark/70 group-hover:text-brand-dark transition-colors">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>
      
      {(currentMinPrice || currentMaxPrice || currentSort) && (
        <button 
          onClick={() => router.push('?', { scroll: false })}
          className="text-xs uppercase tracking-widest text-brand-green-500 hover:text-brand-green-700 transition-colors mt-4 block"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
