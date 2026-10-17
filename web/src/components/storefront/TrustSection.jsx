import { Link } from 'react-router-dom';

const principles = [
  ['Know what’s inside', 'Every product page lists the complete ingredients, amounts, origin and allergen information.'],
  ['Made with care', 'Our supplements are made in GMP-certified facilities and third-party tested for purity.'],
  ['Simple to use', 'Two a day, morning and evening, with food — easy to make part of your everyday routine.'],
];

export default function TrustSection() {
  return (
    <section className="jayam-promise">
      <div className="jayam-promise-heading">
        <div>
          <p className="jayam-eyebrow">Clean, safe and transparent</p>
          <h2>Care, in the choices<br />we <em>make.</em></h2>
        </div>
        <div className="jayam-promise-intro">
          <p>Wondering what’s in our products, how to use them, or whether they can be taken every day? We’ve answered the questions customers ask most.</p>
          <Link to="/faq">Read the FAQ <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <ul className="jayam-promise-list">
        {principles.map(([principle, detail], index) => (
          <li key={principle} className={`jayam-promise-principle jayam-promise-principle-${index + 1}`}>
            <div className="jayam-principle-copy">
              <strong>{principle}</strong>
              <p>{detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
