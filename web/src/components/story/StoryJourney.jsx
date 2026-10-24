import { useEffect, useRef, useState } from 'react';
import StoryLandscape from './StoryLandscape';
import MoringaTree from './MoringaTree';

// The Our Story opening: a pinned full-screen scene that evolves as the visitor scrolls.
// Each panel takes a little over half a screen of scrolling and holds still while it is
// read, then crossfades quickly into the next; the disc rises and the tree grows gently.
// Scroll length per panel, in vh
const PANEL_SCROLL = 55;

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
      const raw = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;
      // Rounded so tiny scroll movements don't trigger new renders
      setProgress(Math.round(raw * 400) / 400);
      setCompact(window.innerWidth < 860);
    };
    // At most one update per animation frame
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
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
  const treeGrowth = 0.88 + 0.12 * Math.min(progress / 0.85, 1);

  return (
    <section ref={sectionRef} className="sj" style={{ height: `${PANELS.length * PANEL_SCROLL + 45}vh` }} aria-label="Our story">
      <div className="sj-stage">
        <StoryLandscape progress={progress} compact={compact} />

        <div className="sj-tree" style={{ transform: `scale(${treeGrowth.toFixed(3)})` }} aria-hidden="true">
          <MoringaTree className="sj-tree-svg" lite={compact} />
        </div>

        <div className="sj-panels">
          {PANELS.map((panel, index) => {
            // Fully visible while it is the current panel; the outgoing panel fades out
            // just before the next fades in, so text never overlaps
            const distance = Math.abs(step - index);
            const opacity = Math.min(1, Math.max(0, (0.48 - distance) / 0.28));
            const offset = (index - step) * 24;
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
