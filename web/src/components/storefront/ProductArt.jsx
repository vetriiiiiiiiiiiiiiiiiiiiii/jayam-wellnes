import { Leaf } from 'lucide-react';
import { CATEGORY_LABELS } from '../../lib/store';

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

/**
 * Paper-label artwork shown in place of a product photo.
 * size: "card" (shop grid) or "hero" (product page)
 */
export default function ProductArt({ product, size = 'card' }) {
  const { title, form } = labelParts(product);
  const isOrganic = /^Organic\s/i.test(product.name);
  const meta = specValue(product, 'Contents') || specValue(product, 'Skin type') || '';
  const tone = product.productType === 'SKINCARE' ? 'warm' : 'sage';

  return (
    <div className={`jayam-art jayam-art--${size} jayam-art--${tone}`} role="img" aria-label={product.name}>
      <div className="jayam-art-label">
        <Leaf className="jayam-art-mark" strokeWidth={1.4} aria-hidden="true" />
        <span className="jayam-art-brand">Jayam{isOrganic ? ' · Organic' : ''}</span>
        <strong className="jayam-art-title">{title}</strong>
        {form && <em className="jayam-art-form">{form}</em>}
        <span className="jayam-art-rule" aria-hidden="true" />
        <span className="jayam-art-meta">{meta || product.category || CATEGORY_LABELS[product.productType]}</span>
      </div>
    </div>
  );
}
