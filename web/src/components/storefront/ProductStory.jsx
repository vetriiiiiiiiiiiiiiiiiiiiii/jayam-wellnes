import { Check, Info, Moon, Sun, Sunrise } from 'lucide-react';
import ProductArt from './ProductArt';

// The product's story, told in five chapters that lead into each other:
// who it is for → why you reach for it → what is inside → is it right for you → the promise.
// Each chapter has its own layout so the page never repeats itself.
// Text is editable in Admin → Site content → Product stories.
const MOMENT_ICONS = [Sunrise, Sun, Moon];

export default function ProductStory({ product, story, description, onBuy }) {
  if (!story) return null;
  const { lifestyle, moments, about, fit, promise } = story;

  return (
    <div className="ps">
      {lifestyle && (
        <section className="ps-life" aria-labelledby="ps-life-title">
          <span className="ps-life-word" aria-hidden="true">{lifestyle.word}</span>
          <div className="ps-life-inner">
            <div className="ps-life-copy" data-reveal>
              {lifestyle.label && <p className="ps-chip">{lifestyle.label}</p>}
              <h2 id="ps-life-title">{lifestyle.title}</h2>
              <p>{lifestyle.body}</p>
              {lifestyle.tags?.length > 0 && (
                <ul className="ps-tags" aria-label="Fits into">
                  {lifestyle.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              )}
            </div>
            <div className="ps-life-visual" aria-hidden="true" data-reveal>
              <span className="ps-life-pack"><ProductArt product={product} /></span>
              <span className="ps-life-seal"><img src="/jayam-logo.png" alt="" loading="lazy" /></span>
            </div>
          </div>
        </section>
      )}

      {moments?.items?.length > 0 && (
        <section className="ps-day" aria-labelledby="ps-day-title">
          <h2 id="ps-day-title" className="pg-section-title" data-reveal>{moments.title}</h2>
          <ol className="ps-timeline">
            {moments.items.map(({ time, title, body }, index) => {
              const Icon = MOMENT_ICONS[index % MOMENT_ICONS.length];
              return (
                <li key={`${index}-${title}`} data-reveal style={{ transitionDelay: `${index * 90}ms` }}>
                  <span className="ps-node" aria-hidden="true"><Icon size={22} strokeWidth={1.7} /></span>
                  <p className="ps-time">{time}</p>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {about && (
        <section className="ps-about" aria-labelledby="ps-about-title">
          <div className="ps-about-inner">
            <div className="ps-about-copy" data-reveal>
              {about.eyebrow && <p className="pg-eyebrow">{about.eyebrow}</p>}
              <h2 id="ps-about-title">{about.title}</h2>
              <p>{about.body}</p>
              {description && (
                <details className="ps-more">
                  <summary>Read the full description</summary>
                  {description.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </details>
              )}
            </div>
            {about.facts?.length > 0 && (
              <ul className="ps-facts">
                {about.facts.map(({ value, unit, label }, index) => (
                  <li key={`${index}-${label}`} data-reveal style={{ transitionDelay: `${index * 90}ms` }}>
                    <strong>{value}<span>{unit}</span></strong>
                    <p>{label}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {fit && (
        <section className="ps-fit" aria-labelledby="ps-fit-title">
          <h2 id="ps-fit-title" className="pg-section-title" data-reveal>{fit.title}</h2>
          <div className="ps-fit-grid">
            {fit.forYou?.length > 0 && (
              <article className="ps-fit-card ps-fit-card--yes" data-reveal>
                <h3>Made for you if…</h3>
                <ul>
                  {fit.forYou.map((line) => <li key={line}><Check size={18} strokeWidth={2.2} aria-hidden="true" />{line}</li>)}
                </ul>
              </article>
            )}
            {fit.goodToKnow?.length > 0 && (
              <article className="ps-fit-card ps-fit-card--note" data-reveal>
                <h3>Good to know</h3>
                <ul>
                  {fit.goodToKnow.map((line) => <li key={line}><Info size={18} strokeWidth={2} aria-hidden="true" />{line}</li>)}
                </ul>
              </article>
            )}
          </div>
        </section>
      )}

      {promise && (
        <section className="ps-promise" data-reveal>
          <span className="ps-promise-seal" aria-hidden="true"><img src="/jayam-logo.png" alt="" loading="lazy" /></span>
          <p className="ps-promise-line">{promise}</p>
          {onBuy && <button type="button" className="ap-pill" onClick={onBuy}>Add to bag</button>}
        </section>
      )}
    </div>
  );
}
