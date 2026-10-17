import { Link } from 'react-router-dom';

const principles = [
  'Simple, clean products',
  'Carefully selected ingredients',
  'Plant-based wellness',
  'No unnecessary complexity',
  'Quality and transparency',
  'Products we would feel comfortable giving to our own families',
  'Long-term everyday wellness, not quick fixes',
];

export default function OurStoryPage() {
  return (
    <main className="story-page">
      <header className="story-hero">
        <p className="story-eyebrow">A little about us</p>
        <h1>Wellness,<br /><em>with care.</em></h1>
        <p className="story-intro">A simpler way to care for yourself, inspired by nature and made with the people we love in mind.</p>
      </header>

      <article className="story-copy">
        <p>Jayam began with a simple belief: the things we choose for our health should be chosen with care.</p>
        <p>For generations, families have trusted nature, traditional ingredients, and simple everyday habits as part of their well-being. That wisdom continues to inspire us.</p>
        <p>Today, wellness can feel complicated, with endless choices and long lists of unfamiliar ingredients. Jayam was created to offer something simpler — thoughtful products, carefully chosen, and worthy of your trust.</p>
        <p>Our bodies are precious, and what we choose to put into them matters. We believe in keeping wellness simple, staying close to nature, respecting the body, avoiding unnecessary complexity, and supporting lasting everyday wellness — not quick fixes.</p>
        <p>Our journey began with Moringa, but Jayam is about more than one ingredient. We continue to explore purposeful wellness products that we would be proud to place in the hands of our own families.</p>
        <h2 className="story-subhead">What Jayam stands for</h2>
        <ul className="story-principles">
          {principles.map((principle) => <li key={principle}>{principle}</li>)}
        </ul>
        <p>Because wellness is personal, and trust matters.</p>
        <img className="story-logo" src="/jayam-logo.png" alt="Jayam — Bringing the best to your hands" />
        <p className="story-signoff">Jayam — Bringing the best to your hands.</p>
        <Link to="/shop" className="story-link">Explore our products <span aria-hidden="true">↗</span></Link>
      </article>
    </main>
  );
}
