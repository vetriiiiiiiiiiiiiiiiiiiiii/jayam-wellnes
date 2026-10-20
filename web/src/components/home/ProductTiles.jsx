import { Link } from 'react-router-dom';
import ProductArt from '../storefront/ProductArt';
import { useCart } from '../storefront/CartProvider';
import { formatPrice } from '../../lib/store';

// Product tiles stacked like apple.com: big name, one-line tagline, "Learn more" and "Buy",
// the product large below. Two full-width tiles, then a row of three.
const FEATURED = [
  { slug: 'moringa-leaf-amla-tablets', tone: 'grey', kicker: 'Our bestselling blend' },
  { slug: 'beauty-drops-moringa-facial-elixir', tone: 'hay', kicker: 'For skin' },
];
const ROW = [
  { slug: 'moringa-leaf-capsules', tone: 'grey' },
  { slug: 'moringa-flower-tablets', tone: 'grey' },
  { slug: 'moringa-seed-capsules', tone: 'grey' },
];

const shortName = (product) => product.name.replace(/^Organic\s+/i, '').split(' — ')[0];
const contents = (product) => product.specs?.find((spec) => spec.name === 'Contents')?.value.split('·')[0].trim();

function Tile({ product, tone, kicker, size, onBuy }) {
  const detail = contents(product);
  return (
    <article className={`pt-tile pt-tile--${tone} pt-tile--${size}`} data-reveal>
      <div className="pt-copy">
        {kicker && <p className="pt-kicker">{kicker}</p>}
        <h3>{shortName(product)}</h3>
        {product.tagline && <p className="pt-tagline">{product.tagline}</p>}
        <div className="ap-ctas">
          <Link to={`/products/${product.slug}`} className="ap-pill">Learn more</Link>
          <button type="button" className="ap-pill ap-pill--outline" onClick={() => onBuy(product)}>Buy</button>
        </div>
        <p className="pt-price">{formatPrice(product.price)}{detail ? ` · ${detail}` : ''}</p>
      </div>
      <Link to={`/products/${product.slug}`} className="pt-art" tabIndex={-1} aria-hidden="true">
        <ProductArt product={product} />
      </Link>
    </article>
  );
}

export default function ProductTiles({ products }) {
  const { addToCart } = useCart();
  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]));
  const featured = FEATURED.filter(({ slug }) => bySlug[slug]);
  const row = ROW.filter(({ slug }) => bySlug[slug]);

  if (featured.length + row.length === 0) return null;

  const buy = (product) => {
    addToCart({ id: product.id, productId: product.id, name: product.name, price: product.price, image: product.images?.[0]?.url });
    window.dispatchEvent(new Event('jayam:cart-open'));
  };

  return (
    <section id="collection" className="pt" aria-label="The collection">
      {featured.map((item) => (
        <Tile key={item.slug} product={bySlug[item.slug]} tone={item.tone} kicker={item.kicker} size="wide" onBuy={buy} />
      ))}
      <div className="pt-row">
        {row.map((item) => (
          <Tile key={item.slug} product={bySlug[item.slug]} tone={item.tone} size="small" onBuy={buy} />
        ))}
      </div>
    </section>
  );
}
