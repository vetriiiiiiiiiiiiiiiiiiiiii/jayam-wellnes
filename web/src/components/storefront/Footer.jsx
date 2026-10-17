import { Link } from 'react-router-dom';
import { CONTACT } from '../../lib/store';

const footerLinks = [
  { label: 'Shop', to: '/shop' },
  { label: 'Our Story', to: '/our-story' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Shipping', to: '/faq#shipping' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Contact', to: '/contact' },
];
const currentYear = new Date().getFullYear();

export default function Footer() {
  const socialLinks = [
    CONTACT.email && { label: 'Email', href: `mailto:${CONTACT.email}` },
    CONTACT.whatsapp && { label: 'WhatsApp', href: `https://wa.me/${CONTACT.whatsapp}` },
    CONTACT.instagram && { label: 'Instagram', href: CONTACT.instagram },
  ].filter(Boolean);

  return (
    <footer className="jayam-footer">
      <div className="jayam-footer-main">
        <div className="jayam-footer-brand">
          <img src="/jayam-logo.png" alt="" />
          <div>
            <p className="jayam-footer-wordmark">JAYAM</p>
            <p className="jayam-footer-tagline">Bringing the best to your hands.</p>
          </div>
        </div>
        <p className="jayam-footer-note">Simple, clean, plant-based wellness. Shipping across the United States, with free shipping on orders $49 and above.</p>
        <nav aria-label="Footer navigation" className="jayam-footer-links">
          {footerLinks.map(({ label, to }) => <Link key={to} to={to}>{label}</Link>)}
          {socialLinks.map(({ label, href }) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{label}</a>
          ))}
        </nav>
      </div>
      <p className="jayam-footer-disclaimer">
        *These statements have not been evaluated by the Food and Drug Administration. Our products are not intended to diagnose, treat, cure, or prevent any disease.
      </p>
      <div className="jayam-footer-bottom">
        <span>© {currentYear} Jayam Wellness</span>
        <span>Wellness is personal. Trust matters.</span>
      </div>
    </footer>
  );
}
