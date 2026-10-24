import { Link } from 'react-router-dom';
import MoringaSprig from './MoringaSprig';
import ProductArt from '../storefront/ProductArt';

// Hero in the apple.com manner: a short centred statement and two calls to action,
// then the Jayam seal — the real brand emblem set in a teal medallion with a turning
// promise ring — with the family of products standing around it.
const LINEUP = [
  { slug: 'moringa-leaf-capsules', position: 'outer-left' },
  { slug: 'beauty-drops-moringa-facial-elixir', position: 'inner-left' },
  { slug: 'moringa-leaf-amla-tablets', position: 'inner-right' },
  { slug: 'moringa-seed-capsules', position: 'outer-right' },
];

export default function JayamHero({ products, content }) {
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
        {content.eyebrow && <p className="jh-eyebrow">{content.eyebrow}</p>}
        <h1>{content.title}</h1>
        {content.sub && <p className="jh-sub">{content.sub}</p>}
        <div className="ap-ctas">
          <a href="#collection" className="ap-pill">{content.primaryCta}</a>
          <Link to="/our-story" className="ap-link">{content.secondaryCta} ›</Link>
        </div>
      </div>

      <div className="hs">
        <div className="hs-seal">
          <svg className="hs-ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="hs-ring-path" d="M100 100 m-86 0 a86 86 0 1 1 172 0 a86 86 0 1 1 -172 0" />
            </defs>
            <text>
              <textPath href="#hs-ring-path" textLength="538" lengthAdjust="spacing">{content.sealRing}</textPath>
            </text>
          </svg>
          <div className="hs-face">
            <img src="/jayam-logo.png" alt="Jayam — Bringing the best to your hands" width="430" height="430" />
          </div>
        </div>

        <div className="hs-lineup">
          {lineup.map(({ product, position }) => (
            <Link key={product.id} to={`/products/${product.slug}`} className={`hs-item hs-item--${position}`} aria-label={product.name}>
              <ProductArt product={product} />
            </Link>
          ))}
        </div>
        <span className="hs-floor" aria-hidden="true" />
      </div>
    </section>
  );
}
