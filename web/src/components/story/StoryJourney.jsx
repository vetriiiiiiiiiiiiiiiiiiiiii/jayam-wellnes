import { useEffect, useRef, useState } from 'react';
import StoryLandscape from './StoryLandscape';
import MoringaSprig from '../home/MoringaSprig';

// The Our Story opening: a pinned full-screen scene that evolves as the visitor scrolls.
// Each panel takes one screen of scrolling; the sun rises and the tree grows across them.
const PANELS = [
  {
    kind: 'title',
    kicker: 'Our story',
    title: <>Wellness, <em>with care.</em></>,
    body: ['A simpler way to care for yourself, inspired by nature and made with the people we love in mind.'],
  },
  {
    kind: 'quote',
    kicker: 'Where it began',
    title: <>“Jayam began with a simple belief: the things we choose for our health should be <em>chosen with care.</em>”</>,
  },
  {
    kind: 'chapter',
    number: '01',
    title: 'Rooted in tradition',
    body: [
      'For generations, families have trusted nature, traditional ingredients, and simple everyday habits as part of their well-being.',
      'That wisdom continues to inspire us.',
    ],
  },
  {
    kind: 'chapter',
    number: '02',
    title: 'Wellness, made simpler',
    body: [
      'Today, wellness can feel complicated, with endless choices and long lists of unfamiliar ingredients.',
      'Jayam was created to offer something simpler — thoughtful products, carefully chosen, and worthy of your trust.',
    ],
  },
  {
    kind: 'chapter',
    number: '03',
    title: 'Respect for the body',
    body: [
      'Our bodies are precious, and what we choose to put into them matters.',
      'We believe in keeping wellness simple, staying close to nature, respecting the body, and supporting lasting everyday wellness — not quick fixes.',
    ],
  },
  {
    kind: 'chapter',
    number: '04',
    title: 'It began with Moringa',
    body: [
      'Our journey began with Moringa, but Jayam is about more than one ingredient.',
      'We continue to explore purposeful wellness products that we would be proud to place in the hands of our own families.',
    ],
  },
];

// Branches of the tree: position on the trunk, angle, size and the progress at which each appears
const BRANCHES = [
  { left: '38%', bottom: '34%', rotate: -58, width: '58%', at: -0.2 },
  { left: '4%', bottom: '42%', rotate: 52, width: '54%', at: 0.2, flip: true },
  { left: '36%', bottom: '55%', rotate: -36, width: '52%', at: 0.38 },
  { left: '8%', bottom: '62%', rotate: 30, width: '48%', at: 0.55, flip: true },
  { left: '22%', bottom: '70%', rotate: -6, width: '46%', at: 0.72 },
];

export default function StoryJourney() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [compact, setCompact] = useState(() => window.innerWidth < 860);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      setProgress(travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0);
      setCompact(window.innerWidth < 860);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
      // Also update directly so the scene stays correct where animation frames are throttled
      update();
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const step = progress * (PANELS.length - 1);
  const active = Math.round(step);
  const treeGrowth = 0.55 + 0.45 * Math.min(progress / 0.85, 1);

  return (
    <section ref={sectionRef} className="sj" style={{ height: `${PANELS.length * 100}vh` }} aria-label="Our story">
      <div className="sj-stage">
        <StoryLandscape progress={progress} compact={compact} />

        <div className="sj-tree" style={{ transform: `scale(${treeGrowth})` }} aria-hidden="true">
          <svg className="sj-trunk" viewBox="0 0 120 600" preserveAspectRatio="none">
            <path d="M70 600 C62 520 78 450 64 380 C52 318 72 250 60 180 C54 140 62 100 58 60" stroke="#5a4a36" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M66 420 C40 400 26 380 14 350" stroke="#5a4a36" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M62 300 C88 280 100 262 112 236" stroke="#5a4a36" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
          {BRANCHES.map((branch) => {
            const visible = Math.min(Math.max((progress - branch.at) / 0.12, 0), 1);
            return (
              <span
                key={`${branch.left}-${branch.bottom}`}
                className="sj-branch-wrap"
                style={{
                  left: branch.left,
                  bottom: branch.bottom,
                  width: branch.width,
                  opacity: visible,
                  transform: `rotate(${branch.rotate}deg) scale(${(branch.flip ? -1 : 1) * (0.7 + 0.3 * visible)}, ${0.7 + 0.3 * visible})`,
                }}
              >
                <MoringaSprig className="sj-branch" pairs={10} />
              </span>
            );
          })}
        </div>

        <div className="sj-panels">
          {PANELS.map((panel, index) => {
            const distance = Math.abs(step - index);
            const opacity = Math.max(0, 1 - distance * 1.8);
            const offset = (index - step) * 40;
            return (
              <article
                key={index}
                className={`sj-panel sj-panel--${panel.kind}`}
                style={{ opacity, transform: `translateY(${offset}px)`, visibility: opacity > 0 ? 'visible' : 'hidden' }}
                aria-hidden={index !== active}
              >
                {panel.number && <span className="sj-number">{panel.number}</span>}
                {panel.kicker && <p className="wl-kicker">{panel.kicker}</p>}
                {panel.kind === 'title' ? <h1>{panel.title}</h1> : panel.kind === 'quote' ? <blockquote>{panel.title}</blockquote> : <h2>{panel.title}</h2>}
                {panel.body?.map((text) => <p key={text}>{text}</p>)}
              </article>
            );
          })}
        </div>

        <ol className="sj-progress" aria-hidden="true">
          {PANELS.map((panel, index) => (
            <li key={index} className={index === active ? 'is-active' : ''}>
              <span>{panel.number || (index === 0 ? '·' : '“')}</span>
            </li>
          ))}
        </ol>

        <span className="sj-scroll-cue" style={{ opacity: Math.max(0, 1 - progress * 8) }} aria-hidden="true">Scroll</span>
      </div>
    </section>
  );
}
