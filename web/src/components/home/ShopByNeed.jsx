import { Link } from 'react-router-dom';
import ProductArt from '../storefront/ProductArt';
import { formatPrice } from '../../lib/store';

// What each product is for, in the customer's words (structure/function wording)
const NEEDS = {
  'moringa-leaf-amla-tablets': { need: 'Immunity & energy', tone: 'sage' },
  'moringa-leaf-capsules': { need: 'Everyday nutrition', tone: 'leaf' },
  'moringa-flower-tablets': { need: 'Women’s wellness', tone: 'blush' },
  'moringa-seed-capsules': { need: 'Men’s vitality', tone: 'sand' },
  'beauty-drops-moringa-facial-elixir': { need: 'Radiant-looking skin', tone: 'sun' },
};

const ORDER = Object.keys(NEEDS);

export default function ShopByNeed({ products }) {
  const items = [...products]
    .filter((product) => NEEDS[product.slug])
    .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

  if (items.length === 0) return null;

  return (
    <section className="wl-section wl-needs">
      <header className="wl-section-head" data-reveal>
        <p className="wl-kicker">Shop by need</p>
        <h2>What does your body <em>need today?</em></h2>
        <p>Five simple botanicals, each made for one part of your everyday routine.</p>
      </header>

      <div className="wl-needs-grid">
        {items.map((product, index) => {
          const { need, tone } = NEEDS[product.slug];
          return (
            <Link key={product.id} to={`/products/${product.slug}`} className={`wl-need-card wl-tone--${tone}`} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
              <span className="wl-need-label">{need}</span>
              <div className="wl-need-art">
                <ProductArt product={product} />
              </div>
              <div className="wl-need-info">
                <h3>{product.name.replace(/^Organic\s+/i, '').split(' — ')[0]}</h3>
                {product.tagline && <p>{product.tagline}</p>}
                <span className="wl-need-meta">
                  {formatPrice(product.price)}
                  <span aria-hidden="true">Explore →</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
