import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="jayam-home-hero">
      <div className="jayam-home-copy">
        <p className="jayam-eyebrow">Natural, plant-based wellness</p>
        <h1><span>Wellness</span><span>starts <em>here.</em></span></h1>
        <p className="jayam-home-intro">
          Simple, clean products made with carefully selected plant ingredients — for long-term everyday wellness, not quick fixes.
        </p>
        <div className="jayam-home-actions">
          <Link to="/shop" className="jayam-primary-link">Shop the collection <span aria-hidden="true">↗</span></Link>
          <Link to="/our-story" className="jayam-secondary-link">Our story</Link>
        </div>
      </div>
      <div className="jayam-home-art">
        <img src="/jayam-logo.png" alt="Jayam Wellness — Bringing the best to your hands" />
      </div>
    </section>
  );
}
