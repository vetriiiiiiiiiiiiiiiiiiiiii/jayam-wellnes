import { Link } from 'react-router-dom';

export default function FinalCta() {
  return (
    <section className="jf" data-reveal>
      <h2>Begin your daily ritual.</h2>
      <p>Free U.S. shipping on orders $49+ · Vegan · Non-GMO · Third-party tested</p>
      <div className="wl-hero-actions">
        <Link to="/shop" className="wl-button wl-button--dark">Shop all products</Link>
        <Link to="/faq" className="wl-button wl-button--ghost">Questions? Read the FAQ</Link>
      </div>
    </section>
  );
}
