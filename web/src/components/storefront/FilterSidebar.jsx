import { useSearchParams } from 'react-router-dom';

const PRICE_RANGES = {
  '': [null, null],
  25: [null, '25'],
  '25-32': ['25', '32'],
  32: ['32', null],
};

// Compact sort and price selects for the shop toolbar
export default function FilterSidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || '';

  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setSearchParams(next, { replace: true });
  };

  const priceValue = Object.keys(PRICE_RANGES).find((key) => {
    const [min, max] = PRICE_RANGES[key];
    return (min || '') === minPrice && (max || '') === maxPrice;
  }) ?? '';

  return (
    <div className="sh-filters">
      <label>
        <span className="sr-only">Sort by</span>
        <select value={sort} onChange={(event) => update({ sort: event.target.value })}>
          <option value="">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Price range</span>
        <select
          value={priceValue}
          onChange={(event) => {
            const [min, max] = PRICE_RANGES[event.target.value];
            update({ minPrice: min, maxPrice: max });
          }}
        >
          <option value="">All prices</option>
          <option value="25">Under $25</option>
          <option value="25-32">$25 – $32</option>
          <option value="32">$32 and above</option>
        </select>
      </label>
    </div>
  );
}
