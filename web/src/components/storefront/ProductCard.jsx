import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartProvider';
import { CATEGORY_LABELS, formatPrice } from '../../lib/store';
import ProductArt from './ProductArt';

export const shortName = (product) => product.name.replace(/^Organic\s+/i, '').split(' — ')[0];

// A product standing on a light tile: the pack first, then name, tagline, price, Buy.
export default function ProductCard({ product }) {
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
    <article className="sc">
      <Link to={`/products/${product.slug}`} className="sc-art" aria-label={`View ${product.name}`}>
        {image ? <img src={image} alt={product.name} loading="lazy" /> : <ProductArt product={product} />}
      </Link>
      <div className="sc-body">
        <p className="sc-kicker">{product.category || CATEGORY_LABELS[product.productType] || 'Wellness'}</p>
        <h2><Link to={`/products/${product.slug}`}>{shortName(product)}</Link></h2>
        {product.tagline && <p className="sc-tagline">{product.tagline}</p>}
        <p className="sc-price">{hasVariants ? 'From ' : ''}{formatPrice(price)}</p>
        <div className="sc-ctas">
          <button type="button" className="ap-pill sc-buy" onClick={buy}>{hasVariants ? 'Choose' : 'Buy'}</button>
          <Link to={`/products/${product.slug}`} className="ap-link sc-more">Learn more ›</Link>
        </div>
      </div>
    </article>
  );
}
