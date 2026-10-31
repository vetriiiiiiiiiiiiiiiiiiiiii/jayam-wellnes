import { BadgeCheck, Clock, Leaf, Package, ShieldCheck, Sparkles } from 'lucide-react';
import { mediaUrl } from '../../lib/media';

// The product's opening screen, realme style: a giant headline, three lifestyle photos
// set diagonally with the Jayam seal (Admin → Products), and its key points underneath.
const ICONS = [Leaf, ShieldCheck, BadgeCheck, Sparkles, Package, Clock];

const jump = (event, id) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function ProductHero({ product, name, category, points, images }) {
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

      <div className={`kv-collage kv-collage--${images.length}`} aria-hidden="true">
        {images.map((image, index) => (
          <figure key={`${index}-${image}`} className={`kv-shot kv-shot--${index + 1}`}>
            <img src={mediaUrl(image)} alt="" decoding="async" fetchPriority={index === 0 ? 'high' : undefined} />
          </figure>
        ))}
        <span className="kv-seal"><img src="/jayam-logo.png" alt="" /></span>
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
