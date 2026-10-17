import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartProvider';
import { CATEGORY_LABELS, formatPrice } from '../../lib/store';
import ProductArt from './ProductArt';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const image = product.images?.[0]?.url;
  const hasVariants = product.variants?.length > 0;
  const price = hasVariants
    ? Math.min(...product.variants.map((variant) => variant.price))
    : product.price;

  const addProduct = (event) => {
    event.preventDefault();
    if (hasVariants) {
      navigate(`/products/${product.slug}`);
      return;
    }
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
    });
    window.dispatchEvent(new Event('jayam:cart-open'));
  };

  return (
    <article className="jayam-product-card">
      <Link to={`/products/${product.slug}`} className="jayam-product-image" aria-label={`View ${product.name}`}>
        {image ? (
          <img src={image} alt={product.name} loading="lazy" />
        ) : (
          <ProductArt product={product} />
        )}
        <span className="jayam-product-kind">{product.category || CATEGORY_LABELS[product.productType] || 'Wellness'}</span>
      </Link>
      <div className="jayam-product-info">
        <div>
          <h2><Link to={`/products/${product.slug}`}>{product.name}</Link></h2>
          {(product.tagline || product.shortDescription) && <p>{product.tagline || product.shortDescription}</p>}
        </div>
        <span className="jayam-product-price">{formatPrice(price)}{hasVariants ? <small> onwards</small> : null}</span>
      </div>
      <button type="button" className="jayam-quick-add" onClick={addProduct}>
        {hasVariants ? 'Choose option' : 'Add to bag'} <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}
