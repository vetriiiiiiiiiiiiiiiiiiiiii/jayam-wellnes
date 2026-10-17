import { Link } from 'react-router-dom';
import MoringaSprig from './MoringaSprig';
import ProductArt from '../storefront/ProductArt';

// Hero still-life: Jayam products on a plinth, with soft moringa-leaf shadows
// falling across a warm backdrop like morning light through leaves.
const ARRANGEMENT = [
  { slug: 'beauty-drops-moringa-facial-elixir', position: 'left' },
  { slug: 'moringa-flower-tablets', position: 'right' },
  { slug: 'moringa-leaf-amla-tablets', position: 'center' },
];

export default function HeroStillLife({ products }) {
  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]));
  const items = ARRANGEMENT.map((item) => ({ ...item, product: bySlug[item.slug] })).filter((item) => item.product);

  return (
    <div className="wl-still">
      <div className="wl-still-backdrop">
        {/* Leaf shadows */}
        <MoringaSprig className="wl-still-shadow wl-still-shadow--one" pairs={11} />
        <MoringaSprig className="wl-still-shadow wl-still-shadow--two" pairs={9} />
      </div>

      <div className="wl-still-plinth" aria-hidden="true" />

      <div className="wl-still-products">
        {items.map(({ product, position }) => (
          <Link
            key={product.id}
            to={`/products/${product.slug}`}
            className={`wl-still-item wl-still-item--${position}`}
            aria-label={product.name}
          >
            <ProductArt product={product} />
          </Link>
        ))}
      </div>
    </div>
  );
}
