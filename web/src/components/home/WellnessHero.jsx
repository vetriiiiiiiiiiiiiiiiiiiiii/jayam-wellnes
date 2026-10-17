import { Link } from 'react-router-dom';
import HeroScene from './HeroScene';
import MoringaSprig from './MoringaSprig';
import ProductArt from '../storefront/ProductArt';

export default function WellnessHero({ featured }) {
  return (
    <section className="wl-hero">
      <div className="wl-hero-copy">
        <p className="wl-kicker">Natural, plant-based wellness</p>
        <h1>
          Small daily rituals,
          <em> rooted in nature.</em>
        </h1>
        <p className="wl-hero-intro">
          Simple, clean botanicals — organic moringa, amla and nothing unnecessary — for long-term everyday wellness, not quick fixes.
        </p>
        <div className="wl-hero-actions">
          <Link to="/shop" className="wl-button">Shop the collection</Link>
          <Link to="/our-story" className="wl-button wl-button--ghost">Our story</Link>
        </div>
        <p className="wl-hero-note">Free U.S. shipping on orders $49+ · Vegan · Non-GMO</p>
      </div>

      <div className="wl-hero-visual">
        <div className="wl-arch">
          <HeroScene />
          <MoringaSprig className="wl-hero-branch" pairs={11} />
        </div>


        {featured && (
          <Link to={`/products/${featured.slug}`} className="wl-hero-product" aria-label={`View ${featured.name}`}>
            <ProductArt product={featured} />
          </Link>
        )}
      </div>
    </section>
  );
}
