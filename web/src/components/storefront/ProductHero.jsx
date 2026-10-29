import { BadgeCheck, Clock, Leaf, Package, ShieldCheck, Sparkles } from 'lucide-react';
import ProductVisual from './ProductVisual';

// The product's opening screen, realme style: a giant headline, the product large and
// floating with the Jayam seal, and its key points in a row underneath.
const ICONS = [Leaf, ShieldCheck, BadgeCheck, Sparkles, Package, Clock];

const jump = (event, id) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function ProductHero({ product, name, category, points }) {
  return (
    <section className="kv" id="overview" aria-labelledby="kv-title">
      <div className="kv-copy">
        <p className="kv-eyebrow">{category}</p>
        <h1 id="kv-title">{product.tagline || name}</h1>
        <p className="kv-name">{product.name}</p>
        <div className="ap-ctas">
          <a href="#buy" className="ap-pill" onClick={(event) => jump(event, 'buy')}>Buy now</a>
          <a href="#features" className="ap-link" onClick={(event) => jump(event, 'features')}>Explore ›</a>
        </div>
      </div>

      <div className="kv-stage" aria-hidden="true">
        <span className="kv-halo" />
        <span className="kv-pack"><ProductVisual product={product} size="hero" eager /></span>
        <span className="kv-seal"><img src="/jayam-logo.png" alt="" /></span>
        <span className="kv-floor" />
      </div>

      {points.length > 0 && (
        <ul className="kv-points">
          {points.slice(0, 4).map((point, index) => {
            const Icon = ICONS[index % ICONS.length];
            return (
              <li key={point}>
                <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                <span>{point}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
