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

// Each product has its own colour story: the panel tint and a matching info card.
// Panels overlap along a slanted edge so one product flows into the next, and the
// next pack already peeks in below the current one.
const THEMES = [
  { name: 'teal', tone: '#dcebe8' },
  { name: 'sage', tone: '#e3eee0' },
  { name: 'deep', tone: '#d3e6e2' },
  { name: 'sea', tone: '#e6f2ee' },
  { name: 'mist', tone: '#eef5ec' },
];

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
        const theme = THEMES[index % THEMES.length];
        const previous = index === 0 ? '#ffffff' : THEMES[(index - 1) % THEMES.length].tone;
        const side = index % 2 === 0 ? 'right' : 'left';
        const next = slugs[index + 1] && bySlug[slugs[index + 1]];

        return (
          <article
            key={slug}
            id={`sw-${slug}`}
            className={`sw-panel sw-panel--${side} sw-theme--${theme.name}`}
            style={{ '--from': previous, '--to': theme.tone }}
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
                <div className="sw-card-top">
                  {copy.badge && <span className="sw-badge">{copy.badge}</span>}
                  <span className="sw-count">{String(index + 1).padStart(2, '0')} / {String(slugs.length).padStart(2, '0')}</span>
                </div>
                <h3>{copy.headline || product.tagline || product.name}</h3>
                <p className="sw-subtitle">{copy.subtitle || product.name}</p>
                {(copy.description || product.shortDescription) && <p className="sw-desc">{copy.description || product.shortDescription}</p>}
                <p className="sw-price">{formatPrice(product.price)}{detail ? ` · ${detail}` : ''}</p>
                <div className="ap-ctas">
                  <Link to={`/products/${slug}`} className="ap-pill">Learn more</Link>
                  <button type="button" className="ap-pill ap-pill--outline" onClick={() => buy(product)}>Buy</button>
                </div>
                {next && (
                  <a href={`#sw-${next.slug}`} className="sw-next">
                    Up next · {(content.items?.[next.slug]?.headline) || next.name} <span aria-hidden="true">↓</span>
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
