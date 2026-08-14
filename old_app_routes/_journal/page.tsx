import InnerNav from '@/components/inner-nav';

const stories = [
  ['Moringa, made simple', 'A closer look at the leaf that inspires everything we make.', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=85'],
  ['A greener morning', 'Three effortless ways to bring a little moringa into your day.', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1200&q=85'],
  ['The art of the pause', 'Why the smallest rituals have the longest reach.', 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=85'],
];
export default function JournalPage() { return <main className="journal-page"><InnerNav /><section className="catalog-intro"><p className="eyebrow">The journal</p><h1>Good things<br/>to <em>linger on.</em></h1></section><section className="article-list">{stories.map(([title, description, image], index) => <article key={title}><div style={{ backgroundImage: `url(${image})` }} /><p>FIELD NOTES · 0{index + 1}</p><h2>{title}</h2><span>{description}</span><button>Read story ↗</button></article>)}</section></main>; }
