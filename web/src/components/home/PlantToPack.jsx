import { FlaskConical, PackageOpen, Sprout, Wind } from 'lucide-react';

// From plant to pack: four raised, tactile tiles in the brand palette.
const STEPS = [
  { icon: Sprout, title: 'Organic botanicals', body: 'Moringa leaves, flowers and seeds, and Amla — carefully selected and sourced from India.', tone: 'fern' },
  { icon: Wind, title: 'Gently vacuum-dried', body: 'A careful process that helps preserve naturally occurring nutrients and botanical character.', tone: 'wheat' },
  { icon: FlaskConical, title: 'Made with care', body: 'Produced in GMP-certified facilities and third-party tested for purity.', tone: 'earth' },
  { icon: PackageOpen, title: 'Plastic-free packs', body: 'Biodegradable paper tubes that protect freshness — and the planet.', tone: 'cherry' },
];

export default function PlantToPack() {
  return (
    <section className="jp">
      <header className="jp-head" data-reveal>
        <p className="wl-kicker">From plant to pack</p>
        <h2>Nothing hidden. <em>Nothing unnecessary.</em></h2>
      </header>
      <ol className="jp-tiles">
        {STEPS.map(({ icon: Icon, title, body, tone }, index) => (
          <li key={title} className={`jp-tile jp-tile--${tone}`} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
            <span className="jp-step">{String(index + 1).padStart(2, '0')}</span>
            <span className="jp-icon"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /></span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
