import ProductPack from './ProductPack';

const FORMS = ['Capsules', 'Tablets'];

// Split a product name into a headline and a form line, e.g.
// "Organic Moringa Seed Capsules" -> { title: "Moringa Seed", form: "Capsules" }
// "Beauty Drops — Moringa & Sweet Orange Seed Facial Elixir" -> { title: "Beauty Drops", form: "Facial Elixir" }
export function labelParts(product) {
  const [main, detail] = product.name.replace(/^Organic\s+/i, '').split(/\s+—\s+/);
  const words = main.split(' ');
  const last = words[words.length - 1];
  if (FORMS.includes(last)) {
    return { title: words.slice(0, -1).join(' '), form: last };
  }
  return { title: main, form: detail?.match(/facial elixir/i) ? 'Facial Elixir' : detail || '' };
}

const specValue = (product, name) => product.specs?.find((spec) => spec.name === name)?.value;

// Soft backdrop colour behind each product's packaging
const BACKDROPS = {
  'moringa-leaf-amla-tablets': 'sage',
  'moringa-leaf-capsules': 'leaf',
  'moringa-flower-tablets': 'blush',
  'moringa-seed-capsules': 'sand',
  'beauty-drops-moringa-facial-elixir': 'sun',
};

/**
 * Illustrated packaging shown in place of a product photo.
 * size: "card" (grids) or "hero" (product page)
 */
export default function ProductArt({ product, size = 'card' }) {
  const { title, form } = labelParts(product);
  const contents = specValue(product, 'Contents');
  const tone = BACKDROPS[product.slug] || (product.productType === 'SKINCARE' ? 'sun' : 'sage');

  return (
    <div className={`jayam-art jayam-art--${size} jayam-art--${tone}`} role="img" aria-label={product.name}>
      <span className="jayam-art-halo" aria-hidden="true" />
      <ProductPack
        product={product}
        title={title}
        form={form}
        meta={contents ? contents.split('·')[0].trim() : ''}
        organic={/^Organic\s/i.test(product.name)}
      />
    </div>
  );
}
