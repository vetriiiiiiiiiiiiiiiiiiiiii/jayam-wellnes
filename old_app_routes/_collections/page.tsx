import InnerNav from '@/components/inner-nav';

const collections = [
  ['herbal-supplements', 'Herbal Supplements', 'Tablets, capsules, and everyday moringa support.', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=85'],
  ['healthy-snacks', 'Healthy Snacks', 'Better breaks, powered by the goodness of moringa.', 'https://images.unsplash.com/photo-1621939514649-280e2aa6f1bb?auto=format&fit=crop&w=1200&q=85'],
  ['super-foods', 'Super Foods', 'Thoughtful pantry staples for the way you live now.', 'https://images.unsplash.com/photo-1611072962073-8a33b456496d?auto=format&fit=crop&w=1200&q=85'],
  ['moringa-herbal-tea', 'Moringa Herbal Tea', 'A slower cup, made with a remarkable leaf.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=85'],
] as const;

export default function CollectionsPage() { return <main className="collections-page"><InnerNav /><section className="catalog-intro"><p className="eyebrow">Shop by intention</p><h1>Find your<br/><em>everyday good.</em></h1></section><div className="collection-list">{collections.map(([slug, name, text, image], index) => <a href={`/collections/${slug}`} className="collection-row" key={slug}><span>0{index + 1}</span><div><h2>{name}</h2><p>{text}</p></div><div className="collection-thumb" style={{ backgroundImage: `url(${image})` }} /><b>↗</b></a>)}</div></main>; }
