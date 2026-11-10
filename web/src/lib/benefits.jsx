// The 12 health benefits a product can show as icons under its hero photos.
// Admin → Products → Product story picks which ones each product shows (saved as keys in
// story.benefits). The icons are the client's own artwork, cut into round images in
// public/benefits/. The wording is kept to supplement "structure/function" language, so
// the ones marked * show with the FDA statement.

export const BENEFITS = [
  { key: 'fitness-skin', label: 'Maintains overall fitness & skin health*' },
  { key: 'hair', label: 'Supports hair growth*' },
  { key: 'protein-omega', label: 'Source of protein & Omega 3, 6 & 9' },
  { key: 'metabolism', label: 'Supports a healthy metabolism*' },
  { key: 'antioxidants', label: 'Antioxidant support*' },
  { key: 'wellness', label: 'Supports overall wellness*' },
  { key: 'hemoglobin', label: 'Supports healthy hemoglobin levels*' },
  { key: 'aging', label: 'Helps reduce visible signs of aging*' },
  { key: 'immunity', label: 'Supports immune function*' },
  { key: 'menstrual', label: 'Supports menstrual comfort for women*' },
  { key: 'blood-sugar', label: 'Supports healthy blood sugar levels*' },
  { key: 'digestion', label: 'Aids healthy digestion*' },
].map((benefit) => ({ ...benefit, icon: <img src={`/benefits/${benefit.key}.webp`} alt="" width="180" height="180" loading="lazy" decoding="async" /> }));

export const BENEFIT_KEYS = BENEFITS.map((benefit) => benefit.key);

// What the five Jayam products show until Admin → Products changes it
export const BENEFIT_DEFAULTS = {
  'moringa-leaf-amla-tablets': ['fitness-skin', 'metabolism', 'antioxidants', 'immunity', 'digestion', 'wellness'],
  'moringa-leaf-capsules': ['protein-omega', 'metabolism', 'antioxidants', 'hemoglobin', 'digestion', 'wellness'],
  'moringa-flower-tablets': ['fitness-skin', 'antioxidants', 'aging', 'immunity', 'menstrual', 'digestion'],
  'moringa-seed-capsules': ['protein-omega', 'metabolism', 'antioxidants', 'immunity', 'blood-sugar', 'wellness'],
  'beauty-drops-moringa-facial-elixir': ['fitness-skin', 'hair', 'antioxidants', 'aging'],
};

// The product's chosen benefits, in the fixed order of the list above
export const benefitsFor = (product) => {
  const saved = product?.story?.benefits;
  const keys = Array.isArray(saved) ? saved : BENEFIT_DEFAULTS[product?.slug] || [];
  return BENEFITS.filter((benefit) => keys.includes(benefit.key));
};
