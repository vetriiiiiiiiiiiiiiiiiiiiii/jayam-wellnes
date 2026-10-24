import { useEffect, useState } from 'react';
import { formatPrice } from '../../lib/store';

// The product's own bar, as on realme and apple.com product pages: it sticks under the
// site header with the product name, jump links to each part of the page, the price
// and a Buy button. The link for the section in view is highlighted.
export default function ProductSubnav({ name, price, sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-35% 0px -60% 0px' },
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);

  const jump = (event, id) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="pn" aria-label="Product sections">
      <div className="pn-inner">
        <p className="pn-name">{name}</p>
        <ul className="pn-links">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} className={active === id ? 'is-active' : ''} onClick={(event) => jump(event, id)}>{label}</a>
            </li>
          ))}
        </ul>
        <div className="pn-buy">
          <span>{formatPrice(price)}</span>
          <a href="#buy" className="ap-pill" onClick={(event) => jump(event, 'buy')}>Buy</a>
        </div>
      </div>
    </nav>
  );
}
