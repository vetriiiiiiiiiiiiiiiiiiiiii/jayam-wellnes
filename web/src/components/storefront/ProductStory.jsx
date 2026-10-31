import { Check, Info, Moon, Sun, Sunrise } from 'lucide-react';
import { mediaUrl } from '../../lib/media';

// The product's story, told in five chapters that lead into each other:
// who it is for → why you reach for it → what is inside → is it right for you → the promise.
// Each chapter has its own layout so the page never repeats itself.
// Text is editable in Admin → Site content → Product stories.
const MOMENT_ICONS = [Sunrise, Sun, Moon];

const filled = (value) => typeof value === 'string' && value.trim().length > 0;

// Only the chapters that have something in them are shown
export const storyChapters = (story) => {
  if (!story || typeof story !== 'object') return {};
  const lifestyle = filled(story.lifestyle?.title) ? story.lifestyle : null;
  const items = (story.moments?.items || []).filter((item) => filled(item?.title) || filled(item?.body));
  const moments = items.length ? { ...story.moments, items } : null;
  const about = filled(story.about?.title) ? { ...story.about, facts: (story.about.facts || []).filter((fact) => filled(fact?.value)) } : null;
  const forYou = (story.fit?.forYou || []).filter(filled);
  const goodToKnow = (story.fit?.goodToKnow || []).filter(filled);
  const fit = forYou.length || goodToKnow.length ? { ...story.fit, forYou, goodToKnow } : null;
  const promise = filled(story.promise) ? story.promise : null;
  const photos = (story.collage?.images || []).filter(filled);
  const collage = photos.length ? { ...story.collage, photos } : null;
  return { lifestyle, moments, collage, about, fit, promise };
};

export const hasStory = (story) => Object.values(storyChapters(story)).some(Boolean);

export default function ProductStory({ story, description, onBuy }) {
  if (!hasStory(story)) return null;
  const { lifestyle, moments, collage, about, fit, promise } = storyChapters(story);
  const promisePhoto = filled(story.promiseImage) ? story.promiseImage : null;

  return (
    <div className="ps">
      {lifestyle && (
        <section className="ps-life" aria-labelledby="ps-life-title">
          <span className="ps-life-word" aria-hidden="true">{lifestyle.word}</span>
          <div className={`ps-life-inner${lifestyle.image ? '' : ' ps-life-inner--text'}`}>
            <div className="ps-life-copy" data-reveal>
              {lifestyle.label && <p className="ps-chip">{lifestyle.label}</p>}
              <h2 id="ps-life-title">{lifestyle.title}</h2>
              <p>{lifestyle.body}</p>
              {lifestyle.tags?.filter(filled).length > 0 && (
                <ul className="ps-tags" aria-label="Fits into">
                  {lifestyle.tags.filter(filled).map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              )}
            </div>
            {lifestyle.image && (
              <figure className="ps-life-photo" data-reveal>
                <img src={mediaUrl(lifestyle.image)} alt="" loading="lazy" decoding="async" />
              </figure>
            )}
          </div>
        </section>
      )}

      {moments?.items?.length > 0 && (
        <section className="ps-day" aria-labelledby="ps-day-title">
          <h2 id="ps-day-title" className="pg-section-title" data-reveal>{moments.title}</h2>
          {moments.image && (
            <figure className="ps-day-photo" data-reveal>
              <img src={mediaUrl(moments.image)} alt="" loading="lazy" decoding="async" />
            </figure>
          )}
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

      {collage && (
        <section className={`ps-collage ps-collage--${collage.photos.length}`} aria-label={collage.title || 'Lifestyle photos'}>
          <span className="ps-collage-band" aria-hidden="true" />
          {(collage.eyebrow || collage.title || collage.body) && (
            <header className="ps-collage-head" data-reveal>
              {collage.eyebrow && <p className="pg-eyebrow">{collage.eyebrow}</p>}
              {collage.title && <h2>{collage.title}</h2>}
              {collage.body && <p>{collage.body}</p>}
            </header>
          )}
          <div className="ps-collage-grid">
            {collage.photos.map((photo, index) => (
              <figure key={`${index}-${photo}`} className={`ps-shot ps-shot--${index + 1}`} data-reveal>
                <img src={mediaUrl(photo)} alt="" loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
        </section>
      )}

      {about && (
        <section className="ps-about" aria-labelledby="ps-about-title">
          <div className={`ps-about-inner${about.image ? ' ps-about-inner--photo' : ''}`}>
            {about.image && (
              <figure className="ps-about-photo" data-reveal>
                <img src={mediaUrl(about.image)} alt="" loading="lazy" decoding="async" />
              </figure>
            )}
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
          <div className={`ps-fit-grid${fit.image ? ' ps-fit-grid--photo' : ''}`}>
            {fit.image && (
              <figure className="ps-fit-photo" data-reveal>
                <img src={mediaUrl(fit.image)} alt="" loading="lazy" decoding="async" />
              </figure>
            )}
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
        <section className={`ps-promise${promisePhoto ? ' ps-promise--photo' : ''}`} data-reveal>
          {promisePhoto && <img className="ps-promise-bg" src={mediaUrl(promisePhoto)} alt="" loading="lazy" decoding="async" />}
          <div className="ps-promise-inner">
            <span className="ps-promise-seal" aria-hidden="true"><img src="/jayam-logo.png" alt="" loading="lazy" /></span>
            <p className="ps-promise-line">{promise}</p>
            {onBuy && <button type="button" className="ap-pill" onClick={onBuy}>Add to bag</button>}
          </div>
        </section>
      )}
    </div>
  );
}
