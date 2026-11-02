import { Link } from 'react-router-dom';
import MoringaPhoto from '../story/MoringaPhoto';

// A short invitation into Our Story, with a photo of real moringa trees.
export default function StoryTeaser({ content }) {
  return (
    <section className="js">
      <div className="js-inner" data-reveal>
        <div className="js-copy">
          <p className="wl-kicker">{content.eyebrow}</p>
          <h2>{content.title} <em>{content.accent}</em></h2>
          <p>{content.body}</p>
          <div className="wl-hero-actions">
            <Link to="/our-story" className="wl-button wl-button--light">{content.cta}</Link>
          </div>
        </div>
        <div className="js-tree">
          <MoringaPhoto />
        </div>
      </div>
    </section>
  );
}
