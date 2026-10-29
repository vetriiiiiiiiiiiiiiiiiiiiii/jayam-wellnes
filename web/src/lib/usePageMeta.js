import { useEffect } from 'react';

const SITE = 'Jayam Wellness';
const DEFAULT_DESCRIPTION = 'Simple, clean, plant-based wellness from Jayam — organic Moringa supplements and botanical skincare. Free U.S. shipping on orders $49+.';

const setMeta = (selector, attribute, key, content) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

/**
 * Title, description and share preview for the current page.
 * jsonLd: optional structured data (e.g. a Product), added as a script tag while the page is open.
 */
export default function usePageMeta({ title, description = DEFAULT_DESCRIPTION, image, noindex = false, jsonLd } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE}` : `${SITE} — Bringing the best to your hands`;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href.split('#')[0]);
    if (image) setMeta('meta[property="og:image"]', 'property', 'og:image', new URL(image, window.location.origin).href);
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${window.location.pathname}`;

    let script;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => script?.remove();
  }, [title, description, image, noindex, jsonLd]);
}
