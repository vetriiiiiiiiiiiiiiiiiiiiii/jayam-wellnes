import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical, PackageOpen, Sprout, Wind } from 'lucide-react';
import { SCENES } from './DifferenceScenes';

// "Our difference": four tall cards from plant to pack. Each has an icon disc and
// number on top, a scene in the middle (an illustration, or a photo set in
// Admin → Site content), and its title, text and an arrow link at the bottom.
const LOOKS = [
  { icon: Sprout, tone: 'deep' },
  { icon: Wind, tone: 'sage' },
  { icon: FlaskConical, tone: 'teal' },
  { icon: PackageOpen, tone: 'cream' },
];

export default function PlantToPack({ content }) {
  return (
    <section className="od" aria-labelledby="od-title">
      <header className="od-head" data-reveal>
        <div>
          <p className="od-eyebrow">{content.eyebrow}</p>
          <h2 id="od-title">{content.title} <em>{content.accent}</em></h2>
        </div>
        {content.intro && <p className="od-intro">{content.intro}</p>}
      </header>

      <ol className="od-cards">
        {content.steps.map(({ title, body, link, image }, index) => {
          const { icon: Icon, tone } = LOOKS[index % LOOKS.length];
          const Scene = SCENES[index % SCENES.length];
          const to = link || '/our-story';
          return (
            <li key={`${index}-${title}`} className={`od-card od-card--${tone}`} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="od-scene">
                {image ? <img src={image} alt="" loading="lazy" /> : <Scene />}
              </div>
              <div className="od-top">
                <span className="od-icon"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="od-number">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="od-body">
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
              <Link to={to} className="od-arrow" aria-label={`More about ${title}`}>
                <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
