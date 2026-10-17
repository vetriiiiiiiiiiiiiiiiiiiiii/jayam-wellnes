import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bean, Droplet, Eye, Feather, Flower2, House, Leaf, Sprout, Sunrise, Wind } from 'lucide-react';
import StoryJourney from '../components/story/StoryJourney';
import useScrollReveal from '../lib/useScrollReveal';

const principles = [
  { icon: Feather, text: 'Simple, clean products' },
  { icon: Sprout, text: 'Carefully selected ingredients' },
  { icon: Leaf, text: 'Plant-based wellness' },
  { icon: Wind, text: 'No unnecessary complexity' },
  { icon: Eye, text: 'Quality and transparency' },
  { icon: House, text: 'Products we would feel comfortable giving to our own families' },
  { icon: Sunrise, text: 'Long-term everyday wellness, not quick fixes' },
];

// Every part of the moringa tree, and the Jayam products made from it
const plantParts = [
  { icon: Leaf, part: 'Leaves', line: 'A nutrient-dense green superfood, gently vacuum-dried.', slugs: ['moringa-leaf-capsules', 'moringa-leaf-amla-tablets'] },
  { icon: Flower2, part: 'Flowers', line: 'A distinctive botanical, crafted for women’s wellness.', slugs: ['moringa-flower-tablets'] },
  { icon: Bean, part: 'Seeds', line: 'Pure seed, for everyday vitality.', slugs: ['moringa-seed-capsules'] },
  { icon: Droplet, part: 'Seed & root oils', line: 'Nourishing oils for a radiant-looking glow.', slugs: ['beauty-drops-moringa-facial-elixir'] },
];

export default function OurStoryPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products`)
      .then((response) => Array.isArray(response.data) && setProducts(response.data))
      .catch((error) => console.error('Error fetching products', error));
  }, []);

  useScrollReveal([products.length]);

  const bySlug = Object.fromEntries(products.map((product) => [product.slug, product]));
  return (
    <main className="st-page">
      <StoryJourney />

      {/* ---------- One remarkable plant ---------- */}
      <section className="st-plant">
        <header className="wl-section-head wl-section-head--center" data-reveal>
          <p className="wl-kicker">One remarkable plant</p>
          <h2>Every part of the moringa tree <em>has its own story.</em></h2>
          <p>Jayam crafts each product from a different part of the tree — leaves, flowers and seeds — alongside complementary botanicals like Amla.</p>
        </header>
        <div className="st-plant-grid">
          {plantParts.map(({ icon: Icon, part, line, slugs }, index) => {
            const items = slugs.map((slug) => bySlug[slug]).filter(Boolean);
            return (
              <article key={part} className="st-plant-card" data-reveal style={{ transitionDelay: `${index * 90}ms` }}>
                <span className="st-plant-icon"><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></span>
                <h3>{part}</h3>
                <p>{line}</p>
                <ul>
                  {items.map((product) => (
                    <li key={product.id}>
                      <Link to={`/products/${product.slug}`}>
                        {product.name.replace(/^Organic\s+/i, '').split(' — ')[0]} <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------- What we stand for ---------- */}
      <section className="st-values">
        <header className="wl-section-head wl-section-head--center" data-reveal>
          <p className="wl-kicker">What Jayam stands for</p>
          <h2>Seven promises, <em>kept simply.</em></h2>
        </header>
        <ul className="st-values-grid">
          {principles.map(({ icon: Icon, text }, index) => (
            <li key={text} data-reveal style={{ transitionDelay: `${index * 60}ms` }}>
              <Icon size={22} strokeWidth={1.4} aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Sign-off ---------- */}
      <section className="st-signoff" data-reveal>
        <div className="st-signoff-emblem">
          <img src="/jayam-logo.png" alt="Jayam — Bringing the best to your hands" />
        </div>
        <p className="st-signoff-line">Because wellness is personal, <em>and trust matters.</em></p>
        <div className="wl-hero-actions">
          <Link to="/shop" className="wl-button">Explore our products</Link>
          <Link to="/contact" className="wl-button wl-button--ghost">Get in touch</Link>
        </div>
      </section>
    </main>
  );
}
