import { Link } from 'react-router-dom';
import MoringaTree from '../story/MoringaTree';

// A short invitation into Our Story, with the moringa tree from that page.
export default function StoryTeaser() {
  return (
    <section className="js">
      <div className="js-inner" data-reveal>
        <div className="js-copy">
          <p className="wl-kicker">Our story</p>
          <h2>It began with <em>Moringa.</em></h2>
          <p>Jayam began with a simple belief: the things we choose for our health should be chosen with care. Every product is one we would be proud to place in the hands of our own families.</p>
          <div className="wl-hero-actions">
            <Link to="/our-story" className="wl-button wl-button--light">Read our story</Link>
          </div>
        </div>
        <div className="js-tree" style={{ '--p': 1 }} aria-hidden="true">
          <MoringaTree className="js-tree-svg" lite />
        </div>
      </div>
    </section>
  );
}
