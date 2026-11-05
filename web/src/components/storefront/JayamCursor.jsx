import { useEffect } from 'react';

// The leaf cursor itself is plain CSS (jayam-story.css), switched on for the storefront
// by the jayam-site class (the admin panel keeps the normal cursor). This also adds one
// touch for mouse users who haven't asked for reduced motion: a few leaflets scatter
// from where a product goes into the bag.

const ADD_TO_BAG = '.pa-add, .sw-card .ap-pill--accent, .at .ap-pill--accent, .ps-promise .ap-pill--accent';

export default function JayamCursor() {
  useEffect(() => {
    document.documentElement.classList.add('jayam-site');
    return () => document.documentElement.classList.remove('jayam-site');
  }, []);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || calm.matches) return undefined;

    const onClick = (event) => {
      const button = event.target instanceof Element ? event.target.closest(ADD_TO_BAG) : null;
      if (!button || button.disabled) return;
      for (let i = 0; i < 7; i += 1) {
        const leaf = document.createElement('span');
        const angle = (Math.PI * 2 * i) / 7 + Math.random() * 0.6;
        const distance = 40 + Math.random() * 30;
        leaf.className = 'jc-burst';
        leaf.style.left = `${event.clientX}px`;
        leaf.style.top = `${event.clientY}px`;
        leaf.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        leaf.style.setProperty('--dy', `${Math.sin(angle) * distance - 20}px`);
        leaf.style.setProperty('--turn', `${Math.round(angle * 57 + 90)}deg`);
        leaf.style.animationDelay = `${i * 18}ms`;
        document.body.appendChild(leaf);
        leaf.addEventListener('animationend', () => leaf.remove(), { once: true });
      }
    };

    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
