import { Link } from 'react-router-dom';
import MoringaSprig from './MoringaSprig';

// Hero in the apple.com manner: a short centred statement and two calls to action,
// then the Jayam seal — the real brand emblem in a teal medallion with a turning promise ring.
export default function JayamHero({ content }) {
  return (
    <section className="jh">
      <div className="jh-leaves" aria-hidden="true">
        <MoringaSprig className="jh-leaf jh-leaf--back" pairs={12} />
        <MoringaSprig className="jh-leaf jh-leaf--mid" pairs={11} />
        <MoringaSprig className="jh-leaf jh-leaf--front" pairs={10} />
      </div>

      <div className="jh-copy">
        {content.eyebrow && <p className="jh-eyebrow">{content.eyebrow}</p>}
        <h1>{content.title}</h1>
        {content.sub && <p className="jh-sub">{content.sub}</p>}
        <div className="ap-ctas">
          <a href="#collection" className="ap-pill">{content.primaryCta}</a>
          <Link to="/our-story" className="ap-link">{content.secondaryCta} ›</Link>
        </div>
      </div>

      <div className="hs">
        <div className="hs-seal">
          <svg className="hs-ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="hs-ring-path" d="M100 100 m-86 0 a86 86 0 1 1 172 0 a86 86 0 1 1 -172 0" />
            </defs>
            <text>
              <textPath href="#hs-ring-path" textLength="538" lengthAdjust="spacing">{content.sealRing}</textPath>
            </text>
          </svg>
          <div className="hs-face">
            <img src="/jayam-logo.png" alt="Jayam — Bringing the best to your hands" width="430" height="430" fetchPriority="high" decoding="async" />
          </div>
        </div>
      </div>
    </section>
  );
}
