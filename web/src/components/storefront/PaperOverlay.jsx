import { useEffect, useRef } from 'react';

// Crumpled-paper texture behind the page, fading out as the visitor scrolls.
// Only this element's opacity changes on scroll (once per frame), so the rest of
// the page is never restyled or repainted — important for smooth scrolling on phones.
const START_OPACITY = 0.26;

export default function PaperOverlay() {
  const ref = useRef(null);

  useEffect(() => {
    let frame = 0;
    let last = -1;

    const update = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / 1400, 1);
      const eased = progress * progress * (3 - 2 * progress);
      const opacity = Math.round(START_OPACITY * (1 - eased) * 100) / 100;
      if (opacity !== last && ref.current) {
        ref.current.style.opacity = opacity;
        last = opacity;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <div ref={ref} className="paper-crumple" aria-hidden="true" />;
}
