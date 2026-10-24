import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartProvider';
import { CATEGORY_LABELS, formatPrice } from '../../lib/store';
import ProductArt from './ProductArt';

export const shortName = (product) => product.name.replace(/^Organic\s+/i, '').split(' — ')[0];

// Curated order for listings: the bestseller first, then her, him, the starter and skincare
export const PRODUCT_ORDER = [
  'moringa-leaf-amla-tablets',
  'moringa-flower-tablets',
  'moringa-seed-capsules',
  'moringa-leaf-capsules',
  'beauty-drops-moringa-facial-elixir',
];

export const curated = (products) => [...products].sort((a, b) => {
  const rank = (product) => (PRODUCT_ORDER.indexOf(product.slug) + 1) || PRODUCT_ORDER.length + 1;
  return rank(a) - rank(b);
});

// Each product's tile tint, from the palette
const TINTS = {
  'moringa-leaf-amla-tablets': 'teal',
  'moringa-flower-tablets': 'sage',
  'moringa-seed-capsules': 'deep',
  'moringa-leaf-capsules': 'sea',
  'beauty-drops-moringa-facial-elixir': 'mist',
};

const KICKERS = {
  'moringa-leaf-amla-tablets': 'Bestseller',
  'moringa-flower-tablets': 'For her',
  'moringa-seed-capsules': 'For him',
  'moringa-leaf-capsules': 'Start here',
  'beauty-drops-moringa-facial-elixir': 'Skincare',
};

// A product tile in the apple.com manner: kicker, big name, one-line tagline,
// "Learn more" and "Buy", the price, then the product large at the bottom.
// size: "feature" (full width), "regular" (half width) or "compact" (thirds)
export default function ProductCard({ product, size = 'regular' }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const image = product.images?.[0]?.url;
  const hasVariants = product.variants?.length > 0;
  const price = hasVariants
    ? Math.min(...product.variants.map((variant) => variant.price))
    : product.price;

  const buy = () => {
    if (hasVariants) {
      navigate(`/products/${product.slug}`);
      return;
    }
    addToCart({ id: product.id, productId: product.id, name: product.name, price: product.price, image });
    window.dispatchEvent(new Event('jayam:cart-open'));
  };

  return (
    <article className={`at at--${size} at--${TINTS[product.slug] || 'mist'}`}>
      <div className="at-copy">
        <p className="at-kicker">{KICKERS[product.slug] || product.category || CATEGORY_LABELS[product.productType] || 'Wellness'}</p>
        <h2><Link to={`/products/${product.slug}`}>{shortName(product)}</Link></h2>
        {product.tagline && <p className="at-tagline">{product.tagline}</p>}
        <div className="at-ctas">
          <Link to={`/products/${product.slug}`} className="ap-pill">Learn more</Link>
          <button type="button" className="ap-pill ap-pill--outline" onClick={buy}>{hasVariants ? 'Choose' : 'Buy'}</button>
        </div>
        <p className="at-price">{hasVariants ? 'From ' : ''}{formatPrice(price)}</p>
      </div>
      <Link to={`/products/${product.slug}`} className="at-art" tabIndex={-1} aria-hidden="true">
        {image ? <img src={image} alt="" loading="lazy" /> : <ProductArt product={product} />}
      </Link>
    </article>
  );
}
