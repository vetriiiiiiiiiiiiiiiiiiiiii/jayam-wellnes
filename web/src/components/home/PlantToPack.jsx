import { FlaskConical, PackageOpen, Sprout, Wind } from 'lucide-react';

// From plant to pack: four raised, tactile tiles in the brand palette.
// Text is editable in Admin → Site content; icons and tones stay with the position.
const LOOKS = [
  { icon: Sprout, tone: 'fern' },
  { icon: Wind, tone: 'wheat' },
  { icon: FlaskConical, tone: 'earth' },
  { icon: PackageOpen, tone: 'cherry' },
];

export default function PlantToPack({ content }) {
  return (
    <section className="jp">
      <header className="jp-head" data-reveal>
        <p className="wl-kicker">{content.eyebrow}</p>
        <h2>{content.title} <em>{content.accent}</em></h2>
      </header>
      <ol className="jp-tiles">
        {content.steps.map(({ title, body }, index) => {
          const { icon: Icon, tone } = LOOKS[index % LOOKS.length];
          return (
          <li key={`${index}-${title}`} className={`jp-tile jp-tile--${tone}`} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
            <span className="jp-step">{String(index + 1).padStart(2, '0')}</span>
            <span className="jp-icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /></span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
          );
        })}
      </ol>
    </section>
  );
}
