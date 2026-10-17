import { useEffect } from 'react';

// Softly fades elements marked with data-reveal up into view as they are scrolled to.
// Elements are only hidden once this runs, never for visitors who prefer reduced motion,
// and positions are checked directly on scroll so nothing can stay hidden.
export default function useScrollReveal(deps = []) {
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    let pending = [...document.querySelectorAll('[data-reveal]:not(.is-revealed)')];

    const reveal = (element) => {
      element.classList.add('is-revealed');
      element.classList.remove('reveal-pending');
      // Staggered delays are for the entrance only, not later hover effects
      window.setTimeout(() => { element.style.transitionDelay = ''; }, 1400);
    };

    const check = () => {
      const threshold = window.innerHeight * 0.94;
      pending = pending.filter((element) => {
        if (element.getBoundingClientRect().top < threshold) {
          reveal(element);
          return false;
        }
        return true;
      });
      if (pending.length === 0) {
        window.removeEventListener('scroll', check);
        window.removeEventListener('resize', check);
      }
    };

    // Hide only what is still below the fold; anything already visible stays put
    const threshold = window.innerHeight * 0.94;
    pending = pending.filter((element) => {
      if (element.getBoundingClientRect().top < threshold) {
        element.classList.add('is-revealed');
        return false;
      }
      element.classList.add('reveal-pending');
      return true;
    });

    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
