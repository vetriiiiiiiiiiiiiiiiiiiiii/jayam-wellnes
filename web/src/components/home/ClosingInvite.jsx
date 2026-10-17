import { Link } from 'react-router-dom';
import MoringaSprig from './MoringaSprig';

export default function ClosingInvite() {
  return (
    <section className="wl-closing">
      <MoringaSprig className="wl-closing-sprig wl-closing-sprig--left" pairs={8} />
      <MoringaSprig className="wl-closing-sprig wl-closing-sprig--right" pairs={8} />
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
