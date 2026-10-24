import { Link } from 'react-router-dom';
import ProductArt from '../storefront/ProductArt';
import { useCart } from '../storefront/CartProvider';
import { formatPrice } from '../../lib/store';

// One continuous showcase: each product stands on its own panel, a white slanted
// band runs through every panel and changes direction from one to the next, and the
// background colour flows from product to product. Beside each product a card pops up
// with what it is for, in the client's words (editable in Admin → Site content).
const ORDER = [
  'moringa-leaf-amla-tablets',
  'moringa-flower-tablets',
  'moringa-seed-capsules',
  'moringa-leaf-capsules',
  'beauty-drops-moringa-facial-elixir',
];

// Background of each panel, from the palette: mist, sage, a soft sea green, mist, sage
const TONES = ['#e0ecde', '#cde0c9', '#d3ebe3', '#e0ecde', '#cde0c9'];

const contents = (product) => product.specs?.find((spec) => spec.name === 'Contents')?.value.split('·')[0].trim();

export default function ProductShowcase({ products, content }) {
  const { addToCart } = useCart();
  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]));
  const known = ORDER.filter((slug) => bySlug[slug]);
  const extra = products.filter((product) => !ORDER.includes(product.slug)).map((product) => product.slug);
  const slugs = [...known, ...extra];

  const buy = (product) => {
    addToCart({ id: product.id, productId: product.id, name: product.name, price: product.price, image: product.images?.[0]?.url });
    window.dispatchEvent(new Event('jayam:cart-open'));
  };

  return (
    <section id="collection" className="sw" aria-labelledby="sw-title">
      <header className="sw-head" data-reveal>
        {content.eyebrow && <p className="jh-eyebrow">{content.eyebrow}</p>}
        <h2 id="sw-title">{content.title} <em>{content.accent}</em></h2>
        {content.sub && <p className="sw-sub">{content.sub}</p>}
      </header>

      {slugs.length === 0 && <div className="sw-loading" aria-hidden="true" />}

      {slugs.map((slug, index) => {
        const product = bySlug[slug];
        const copy = content.items?.[slug] || {};
        const detail = contents(product);
        const tone = TONES[index % TONES.length];
        const previous = index === 0 ? '#ffffff' : TONES[(index - 1) % TONES.length];
        const side = index % 2 === 0 ? 'right' : 'left';

        return (
          <article
            key={slug}
            className={`sw-panel sw-panel--${side}`}
            style={{ '--from': previous, '--to': tone }}
            aria-label={product.name}
          >
            <span className="sw-band" aria-hidden="true" />
            <div className="sw-inner">
              <Link to={`/products/${slug}`} className="sw-visual" tabIndex={-1} aria-hidden="true" data-reveal>
                <span className="sw-pack"><ProductArt product={product} /></span>
                <span className="sw-seal"><img src="/jayam-logo.png" alt="" loading="lazy" /></span>
                <span className="sw-shadow" />
              </Link>

              <div className="sw-card" data-reveal>
                {copy.badge && <span className="sw-badge">{copy.badge}</span>}
                <h3>{copy.headline || product.tagline || product.name}</h3>
                <p className="sw-subtitle">{copy.subtitle || product.name}</p>
                {(copy.description || product.shortDescription) && <p className="sw-desc">{copy.description || product.shortDescription}</p>}
                <p className="sw-price">{formatPrice(product.price)}{detail ? ` · ${detail}` : ''}</p>
                <div className="ap-ctas">
                  <Link to={`/products/${slug}`} className="ap-pill">Learn more</Link>
                  <button type="button" className="ap-pill ap-pill--outline" onClick={() => buy(product)}>Buy</button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
