import { Link } from 'react-router-dom';
import MoringaSprig from './MoringaSprig';

const stages = [
  { title: 'Organic botanicals', body: 'Moringa leaves, flowers and seeds, and Amla — carefully selected and sourced from India.' },
  { title: 'Gently vacuum-dried', body: 'A careful process that helps preserve naturally occurring nutrients and botanical character.' },
  { title: 'Made with care', body: 'Produced in GMP-certified facilities and third-party tested for purity.' },
  { title: 'Plastic-free packaging', body: 'Packed in biodegradable paper tubes that protect freshness — and the planet.' },
];

export default function MadeWithCare() {
  return (
    <section className="wl-section wl-made">
      <div className="wl-made-intro" data-reveal>
        <p className="wl-kicker">From plant to pack</p>
        <h2>Nothing hidden. <em>Nothing unnecessary.</em></h2>
        <p>No fillers, binders, artificial colors or preservatives — just carefully chosen botanicals and a process we’re proud to share.</p>
        <Link to="/faq" className="wl-text-link">Questions about ingredients? Read the FAQ →</Link>
        <MoringaSprig className="wl-made-sprig" pairs={7} />
      </div>
      <ol className="wl-made-stages">
        {stages.map(({ title, body }, index) => (
          <li key={title} data-reveal>
            <span className="wl-made-number">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
