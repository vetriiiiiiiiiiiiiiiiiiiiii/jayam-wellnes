import { Link } from 'react-router-dom';
import MoringaSprig from './MoringaSprig';
import ProductArt from '../storefront/ProductArt';

// Hero in the apple.com manner: a short centred statement, two calls to action,
// then the Jayam family standing in 3D — with a moringa cluster and a turning badge.
const LINEUP = [
  { slug: 'beauty-drops-moringa-facial-elixir', position: 'left' },
  { slug: 'moringa-leaf-amla-tablets', position: 'center' },
  { slug: 'moringa-seed-capsules', position: 'right' },
];

const BADGE_TEXT = 'ORGANIC · VEGAN · NON-GMO · TESTED · ';

export default function JayamHero({ products }) {
  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]));
  const lineup = LINEUP.map((item) => ({ ...item, product: bySlug[item.slug] })).filter((item) => item.product);

  return (
    <section className="jh">
      <div className="jh-leaves" aria-hidden="true">
        <MoringaSprig className="jh-leaf jh-leaf--back" pairs={12} />
        <MoringaSprig className="jh-leaf jh-leaf--mid" pairs={11} />
        <MoringaSprig className="jh-leaf jh-leaf--front" pairs={10} />
      </div>

      <div className="jh-copy">
        <p className="jh-eyebrow">Organic moringa · Plant-based wellness</p>
        <h1>Small daily rituals.</h1>
        <p className="jh-sub">Rooted in nature. Made with nothing unnecessary.</p>
        <div className="ap-ctas">
          <a href="#collection" className="ap-pill">Shop the collection</a>
          <Link to="/our-story" className="ap-link">Our story ›</Link>
        </div>
      </div>

      <div className="jh-stage">
        <span className="jh-disc" aria-hidden="true" />
        <div className="jh-lineup">
          {lineup.map(({ product, position }) => (
            <Link key={product.id} to={`/products/${product.slug}`} className={`jh-item jh-item--${position}`} aria-label={product.name}>
              <ProductArt product={product} />
            </Link>
          ))}
        </div>
        <span className="jh-ground" aria-hidden="true" />

        <div className="jh-badge" aria-label="Organic, vegan, non-GMO, third-party tested">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id="jh-badge-circle" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
            </defs>
            <text>
              <textPath href="#jh-badge-circle">{BADGE_TEXT}</textPath>
            </text>
          </svg>
          <span className="jh-badge-mark">✱</span>
        </div>
      </div>
    </section>
  );
}
