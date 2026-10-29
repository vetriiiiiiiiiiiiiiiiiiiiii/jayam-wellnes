import { Link } from 'react-router-dom';
import { CONTACT } from '../../lib/store';

// Light, orderly footer in the style of apple.com: fine print first, then link columns.
const PRODUCTS = [
  { label: 'Moringa Leaf + Amla Tablets', to: '/products/moringa-leaf-amla-tablets' },
  { label: 'Moringa Leaf Capsules', to: '/products/moringa-leaf-capsules' },
  { label: 'Moringa Flower Tablets', to: '/products/moringa-flower-tablets' },
  { label: 'Moringa Seed Capsules', to: '/products/moringa-seed-capsules' },
  { label: 'Beauty Drops', to: '/products/beauty-drops-moringa-facial-elixir' },
  { label: 'All products', to: '/shop' },
];

const HELP = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Shipping & returns', to: '/shipping-returns' },
  { label: 'Track your order', to: '/track-order' },
  { label: 'Your account', to: '/account' },
  { label: 'Contact us', to: '/contact' },
];

const currentYear = new Date().getFullYear();

export default function Footer() {
  const social = [
    CONTACT.email && { label: 'Email', href: `mailto:${CONTACT.email}` },
    CONTACT.whatsapp && { label: 'WhatsApp', href: `https://wa.me/${CONTACT.whatsapp}` },
    CONTACT.instagram && { label: 'Instagram', href: CONTACT.instagram },
  ].filter(Boolean);

  return (
    <footer className="af">
      <div className="af-inner">
        <div className="af-fineprint">
          <p>*These statements have not been evaluated by the Food and Drug Administration. Our products are not intended to diagnose, treat, cure, or prevent any disease.</p>
          <p>Free standard shipping on U.S. orders of $49 and above; $5.99 otherwise. Delivery usually takes 2–7 business days. Alaska, Hawaii and U.S. territories may take longer.</p>
        </div>

        <div className="af-columns">
          <section>
            <h2>Shop</h2>
            <ul>{PRODUCTS.map(({ label, to }) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
          </section>
          <section>
            <h2>Help</h2>
            <ul>{HELP.map(({ label, to }) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
          </section>
          <section>
            <h2>Jayam</h2>
            <ul>
              <li><Link to="/our-story">Our Story</Link></li>
              {social.map(({ label, href }) => (
                <li key={label}><a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{label}</a></li>
              ))}
            </ul>
          </section>
        </div>

        <div className="af-bottom">
          <span>Copyright © {currentYear} Jayam Wellness. All rights reserved.</span>
          <span className="af-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Sale</Link>
            <Link to="/shipping-returns">Shipping &amp; Returns</Link>
            <span>United States</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
