import { Link } from 'react-router-dom';

export default function ClosingInvite() {
  return (
    <section className="wl-closing" data-reveal>
      <p className="wl-kicker">Wellness is personal</p>
      <h2>Chosen with care, <em>as if for our own family.</em></h2>
      <p>We only offer products we would feel comfortable giving to the people we love.</p>
      <div className="wl-hero-actions">
        <Link to="/shop" className="wl-button">Begin your ritual</Link>
        <Link to="/our-story" className="wl-button wl-button--ghost">Read our story</Link>
      </div>
    </section>
  );
}
