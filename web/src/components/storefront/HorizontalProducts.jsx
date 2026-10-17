import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function HorizontalProducts({ products }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="jayam-home-products">
      <div className="jayam-home-products-heading">
        <h2>Thoughtfully chosen <em>essentials.</em></h2>
        <Link to="/shop">Explore the shop <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="jayam-product-grid">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
