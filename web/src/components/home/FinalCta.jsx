import { Link } from 'react-router-dom';

export default function FinalCta({ content }) {
  return (
    <section className="jf" data-reveal>
      <h2>{content.title}</h2>
      <p>{content.sub}</p>
      <div className="wl-hero-actions">
        <Link to="/shop" className="wl-button wl-button--dark">{content.primaryCta}</Link>
        <Link to="/faq" className="wl-button wl-button--ghost">{content.secondaryCta}</Link>
      </div>
    </section>
  );
}
