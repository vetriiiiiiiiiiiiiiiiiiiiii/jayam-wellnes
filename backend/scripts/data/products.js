// Jayam product catalogue (source: Jayam e-commerce website questionnaire)

const SUPPLEMENT_DISCLAIMER =
  'This product is a dietary supplement and is not intended to diagnose, treat, cure, or prevent any disease. ' +
  'Consult your healthcare provider if you have a medical condition, are taking medication, or are pregnant or nursing.';

const SUPPLEMENT_WARNINGS =
  'For adults only. Consult a physician if you are pregnant or nursing, taking medication, or have a medical condition. ' +
  'Keep out of reach of children.';

const ALLERGENS =
  'Contains no intentionally added major allergens. Manufactured in a facility that also processes peanuts.';

const supplementUsage = (form) =>
  `Take 2 ${form} daily, one in the morning and one in the evening, preferably with food, or as directed by a healthcare practitioner. Swallow with water.`;

const supplementSpecs = ({ form, ingredient }) => [
  { name: 'Category', value: 'Herbal Supplements' },
  { name: 'Contents', value: `120 ${form} · 2-month supply` },
  { name: 'Ingredients', value: ingredient },
  { name: 'Amount', value: `500 mg per ${form.replace(/s$/, '')}` },
  { name: 'Serving', value: `2 ${form} daily` },
  { name: 'Ingredient origin', value: 'India' },
  { name: 'Dietary', value: 'Vegan, Non-GMO' },
  { name: 'Allergens', value: ALLERGENS },
  { name: 'Storage', value: 'Store in a cool, dry place away from direct sunlight and moisture.' },
  { name: 'Shelf life', value: '2 years from the date of manufacture' },
  { name: 'Suitable for', value: 'Adults only' },
];

module.exports = [
  {
    name: 'Organic Moringa Leaf + Amla Tablets',
    slug: 'moringa-leaf-amla-tablets',
    tagline: 'Two Superfoods. One Daily Ritual.',
    shortDescription:
      'A two-superfood botanical blend to help support immune function, natural energy, radiant-looking skin and digestion.* Vegan, Non-GMO. 120 tablets, a 2-month supply.',
    description:
      'Inspired by traditional plant-based wellness, Jayam Moringa Leaf + Amla Tablets bring together two naturally valued botanicals in one convenient daily supplement. Moringa leaves and Amla (Indian Gooseberry) are appreciated for their naturally occurring nutrients and beneficial plant compounds, including antioxidants. Carefully processed using vacuum-drying technology to help maintain their natural qualities, this thoughtfully crafted blend offers a simple way to incorporate plant-based goodness into your everyday wellness routine.\n\n' +
      'Made with organic Moringa Leaf and Amla, without unnecessary fillers, binders, artificial colors, or preservatives, Jayam reflects a commitment to purity and simplicity. Each 500 mg tablet combines these two botanical ingredients in a convenient, vegan-friendly, Non-GMO formula. Presented in eco-conscious paper packaging, Jayam brings together traditional botanical wisdom, thoughtful processing, and quality-focused craftsmanship for everyday well-being.',
    highlights: [
      { title: 'Two superfoods. One daily ritual', body: 'Jayam combines organic Moringa leaf and Amla in one thoughtfully crafted botanical blend. Two traditionally valued plant ingredients come together in a convenient daily tablet designed to complement your everyday wellness routine.' },
      { title: 'Dual-action immune support', body: 'Combines nutrient-rich Moringa Leaf with Amla, a natural source of Vitamin C, to help support healthy immune function.*' },
      { title: 'Supports energy, digestion & overall wellness', body: 'Helps support natural energy, healthy digestion, and general vitality as part of your everyday routine.*' },
      { title: 'Naturally contains antioxidants & nutrients', body: 'Moringa and Amla naturally contain antioxidants, which help protect cells from oxidative stress, along with nutrients that help support healthy-looking skin and mental clarity.*' },
      { title: 'Pure, potent & clean formula', body: '100% pure, 500 mg tablets. Our botanicals are carefully processed using vacuum-drying technology to help preserve naturally occurring nutrients, botanical character, and ingredient quality while minimizing unnecessary processing.' },
      { title: 'Eco-friendly packaging & GMP-certified quality', body: 'Packaged in biodegradable, moisture-resistant tubes. Manufactured in a GMP-certified facility and third-party lab tested to ensure purity and potency.' },
      { title: 'Pure, plant-based & thoughtfully crafted', body: 'Made with Moringa leaf and Amla without unnecessary fillers, artificial colors, binders or preservatives. Vegan and Non-GMO, every tablet reflects Jayam’s commitment to purity, simplicity, and thoughtful craftsmanship.' },
    ],
    ingredients: 'Organic Moringa Leaf powder and Amla powder — 500 mg per tablet. Ingredients sourced from India.',
    usageInstructions: supplementUsage('tablets'),
    warnings: SUPPLEMENT_WARNINGS,
    disclaimer: SUPPLEMENT_DISCLAIMER,
    price: 31.88,
    productType: 'SUPPLEMENT',
    category: 'Herbal Supplements',
    specs: supplementSpecs({ form: 'tablets', ingredient: 'Organic Moringa Leaf powder, Amla powder' }),
  },
  {
    name: 'Organic Moringa Leaf Capsules',
    slug: 'moringa-leaf-capsules',
    tagline: 'Nature’s Everyday Superfood',
    shortDescription:
      '100% pure Moringa oleifera leaf, naturally containing vitamins, minerals and antioxidants to help support energy and digestive health.* Vegan, Non-GMO. 120 capsules, a 2-month supply.',
    description:
      'Inspired by traditional plant-based wellness, Jayam Moringa Leaf Capsules are crafted from carefully selected organic Moringa oleifera leaves, naturally valued for their diverse plant nutrients and beneficial botanical compounds. Gently vacuum-dried to help maintain their natural qualities, our premium moringa leaves offer a convenient way to bring the goodness of this remarkable green superfood into your everyday wellness routine.\n\n' +
      'Made with pure moringa leaves and no fillers, binders, artificial colors, or preservatives, Jayam delivers simple, plant-based nutrition without unnecessary additives. Vegan-friendly and Non-GMO, each serving of two capsules fits effortlessly into your daily routine, with a two-month supply in every package. Presented in eco-conscious paper packaging, Jayam combines traditional botanical wisdom, thoughtful processing, and a commitment to purity for everyday well-being.',
    highlights: [
      { title: 'Organic moringa leaf capsules', body: 'Experience a clean, plant-based supplement made from carefully hand-selected organic Moringa leaves. Jayam Premium Moringa Leaf Capsules offer a simple way to make this traditionally valued botanical part of your everyday wellness routine.' },
      { title: 'Nature’s everyday superfood', body: 'Moringa leaf has long been appreciated for its naturally nutrient-dense botanical profile. Jayam brings this remarkable green superfood into a convenient capsule format for those looking to add more plant-based nutrition to their daily routine.' },
      { title: 'Vacuum-dried to preserve quality', body: 'Our Moringa oleifera leaves are gently vacuum-dried to help preserve naturally occurring nutrients, botanical character, and ingredient quality. This thoughtful process helps create a clean, carefully prepared Moringa leaf supplement with minimal unnecessary processing.' },
      { title: 'Pure ingredients. Nothing else', body: 'Made with carefully selected organic Moringa leaves and free from fillers, binders, artificial colors, preservatives, coatings and unnecessary additives. Vegan and Non-GMO, with a focus on purity, simplicity, and thoughtful craftsmanship.' },
      { title: 'Clean. Transparent. Trusted', body: 'Non-GMO · Vegan · No artificial ingredients · Carefully sourced & tested. Built on the same Jayam standard of purity and honesty.' },
      { title: 'Eco-friendly packaging, 2 capsules a day & 2-month supply', body: 'With just 2 capsules a day, every pack is a 2-month supply of daily botanical support for natural energy, immune function, joint and bone health, digestion, and healthy skin and hair.* Packed in a 100% biodegradable, zero-plastic paper tube that protects freshness while protecting the planet.' },
      { title: 'The Jayam moringa collection', body: 'Moringa is more than just one part of the tree. Explore Jayam products thoughtfully crafted from leaves, seeds, flowers, and complementary botanicals — each offering its own distinctive way to experience this remarkable plant.' },
    ],
    ingredients: 'Organic Moringa Leaf powder — 500 mg per capsule. Ingredients sourced from India.',
    usageInstructions: supplementUsage('capsules'),
    warnings: SUPPLEMENT_WARNINGS,
    disclaimer: SUPPLEMENT_DISCLAIMER,
    price: 19.88,
    productType: 'SUPPLEMENT',
    category: 'Herbal Supplements',
    specs: supplementSpecs({ form: 'capsules', ingredient: 'Organic Moringa Leaf powder' }),
  },
  {
    name: 'Organic Moringa Flower Tablets',
    slug: 'moringa-flower-tablets',
    tagline: 'Nature’s Goodness, Women’s Wellness',
    shortDescription:
      'A pure botanical supplement for women, to help support hormonal balance, immune function, digestion and radiant-looking skin.* Vegan, Non-GMO. 120 tablets, a 2-month supply.',
    description:
      'Inspired by traditional botanical wisdom, Jayam Moringa Flower Tablets are crafted from carefully selected organic moringa flowers, offering a unique, plant-based addition to women’s everyday wellness routines. Unlike conventional moringa supplements made from leaves, Jayam celebrates the natural goodness of moringa flowers. Thoughtfully prepared using a gentle vacuum-drying process, these tablets offer a simple way to incorporate this distinctive botanical into an active, balanced lifestyle.\n\n' +
      'Made with a single plant-based ingredient, Jayam Moringa Flower Tablets contain no fillers, binders, artificial colors, or preservatives. Vegan-friendly and thoughtfully crafted for women who value clean, uncomplicated wellness, each tablet reflects our commitment to purity and quality. Packaged in eco-conscious paper tubes, Jayam brings together traditional botanical heritage, modern processing, and mindful choices for everyday well-being.',
    highlights: [
      { title: 'Organic moringa flower tablets', body: 'A premium botanical supplement crafted from carefully selected organic moringa flowers. Made with a single ingredient and thoughtfully crafted for women seeking a clean, plant-based addition to their everyday wellness routine. While many moringa supplements are made from leaves, Jayam is crafted from premium moringa flowers, traditionally appreciated for generations for their distinctive botanical experience.' },
      { title: 'Crafted for women’s wellness & balance', body: 'Formulated to help support digestion, immune function, and healthy hormonal balance — for women aged 20+ who want to feel vibrant, balanced, and strong every day.*' },
      { title: 'Naturally contains Omega 3, 6 & 9', body: 'Natural plant-based fatty acids help nourish skin and hair from within, supporting a healthy-looking glow and lustrous-looking hair.*' },
      { title: 'Supports immune function & healthy digestion', body: 'Naturally contains antioxidants and nutrients that help support a healthy immune system and digestive health for overall wellness.*' },
      { title: 'Supports healthy aging', body: 'Naturally contains antioxidants that help protect cells from oxidative stress, supporting everyday vitality as you age.*' },
      { title: 'Pure, potent & eco-conscious wellness', body: 'Hand-harvested, dry vacuum extracted Moringa flowers with no fillers, no binders, no artificial colors, no preservatives, or unnecessary additives. Packaged in biodegradable, plastic-free tubes. Made in a GMP-certified facility and third-party lab tested for purity and potency. Vegan and Non-GMO, every tablet reflects Jayam’s commitment to purity and thoughtful craftsmanship.' },
      { title: 'The Jayam moringa collection', body: 'Every part of the Moringa tree has its own story. Jayam thoughtfully crafts premium botanical products from flowers, leaves, seeds, and complementary botanicals, making it easy to explore the remarkable diversity of one extraordinary plant through a brand committed to quality, authenticity, and sustainability.' },
    ],
    ingredients: 'Organic Moringa Flower powder — 500 mg per tablet. Ingredients sourced from India.',
    usageInstructions: supplementUsage('tablets'),
    warnings: SUPPLEMENT_WARNINGS,
    disclaimer: SUPPLEMENT_DISCLAIMER,
    price: 31.88,
    productType: 'SUPPLEMENT',
    category: 'Herbal Supplements',
    specs: supplementSpecs({ form: 'tablets', ingredient: 'Organic Moringa Flower powder' }),
  },
  {
    name: 'Organic Moringa Seed Capsules',
    slug: 'moringa-seed-capsules',
    tagline: 'Pure Nature, Everyday Vitality',
    shortDescription:
      'Plant-based daily support for men’s energy, skin and digestive health, and immune function* — made from 100% organic moringa seed. Vegan, Non-GMO. 120 capsules, a 2-month supply.',
    description:
      'Rooted in traditional plant-based wellness, Jayam Moringa Seed Capsules are crafted from 100% organic moringa seeds, offering a simple, natural addition to your daily wellness routine. Each capsule contains 500 mg of pure moringa seed, naturally containing beneficial plant compounds, including antioxidants and amino acids. Thoughtfully created for men who value an active, balanced lifestyle, our vacuum-dried moringa seeds preserve the natural goodness of this remarkable plant.\n\n' +
      'Made with a single plant-based ingredient, with no fillers, binders, or artificial additives, Jayam delivers purity you can trust. Just two capsules daily make it easy to incorporate moringa into your everyday routine. Produced in a GMP-compliant facility and packaged in an eco-conscious paper tube, Jayam Moringa Seed Capsules bring together traditional wisdom, modern care, and a commitment to simple wellness.',
    highlights: [
      { title: 'Made exclusively from organic moringa seeds', body: 'Unlike many moringa supplements made from leaves or blended ingredients, Jayam Moringa Seed Capsules are crafted from 100% pure organic moringa seeds.' },
      { title: 'Daily vitality for men', body: 'Each capsule delivers 500 mg of pure, hand-harvested Moringa seed — for men who want to support stamina, immune function, and overall wellness. Just 2 capsules a day to help support natural energy and balance.*' },
      { title: 'Naturally rich in plant nutrients', body: 'Moringa seeds naturally contain amino acids, antioxidants, and beneficial plant compounds. A convenient way to add the goodness of moringa seeds to your daily routine while supporting an active and balanced lifestyle.' },
      { title: '100% pure moringa seed — nothing else', body: 'We honor the ancient wisdom of Moringa with a clean formula: no fillers, no binders, no starch coatings. One powerful ingredient, done right — because your body deserves nothing but nature’s best.' },
      { title: 'Supports energy, stamina & mental clarity', body: 'Plant-based support for your day. Jayam’s pure moringa seed powder helps support natural stamina, focus, and resilience* — and it’s naturally caffeine-free.' },
      { title: 'Joint comfort & active recovery', body: 'Moringa naturally contains beneficial plant compounds that help support joint comfort, flexibility, and healthy recovery after activity — for men living life to the fullest.*' },
      { title: 'Eco-friendly packaging. Purpose-driven wellness', body: 'Our 100% biodegradable, zero-plastic paper tube protects freshness while protecting the planet. Crafted in a GMP-certified facility, dry vacuum extracted to help preserve naturally occurring nutrients, and third-party tested.' },
    ],
    ingredients: 'Organic Moringa Seed powder — 500 mg per capsule. Ingredients sourced from India.',
    usageInstructions: supplementUsage('capsules'),
    warnings: SUPPLEMENT_WARNINGS,
    disclaimer: SUPPLEMENT_DISCLAIMER,
    price: 34.88,
    productType: 'SUPPLEMENT',
    category: 'Herbal Supplements',
    specs: supplementSpecs({ form: 'capsules', ingredient: 'Organic Moringa Seed powder' }),
  },
  {
    name: 'Beauty Drops — Moringa & Sweet Orange Seed Facial Elixir',
    slug: 'beauty-drops-moringa-facial-elixir',
    tagline: 'Ancient Wisdom, Modern Glow',
    shortDescription:
      'A brightening, deeply nourishing facial oil with Moringa seed, rare Moringa root and cold-pressed Sweet Orange seed oils.',
    description:
      'Inspired by Ayurvedic beauty traditions, Jayam Beauty Drops combines Moringa Seed Oil, Moringa Root Oil, and cold-pressed Sweet Orange Seed Oil in a nourishing botanical blend. Rich in naturally occurring fatty acids and antioxidants, this luxurious facial oil helps moisturize and soften skin while promoting a smoother, more radiant-looking complexion.\n\n' +
      'Made with 100% natural botanical oils, its lightweight formula absorbs comfortably, leaving skin feeling soft, supple, and nourished without a heavy, greasy finish. Suitable for all skin types, it can be incorporated into your daily skincare routine as a facial oil, nighttime moisturizer, or before-makeup glow enhancer. Free from paraffins, fillers, and artificial fragrances, Jayam Beauty Drops brings nature-inspired care to your everyday beauty ritual.',
    highlights: [
      { title: 'Ancient wisdom, modern glow', body: 'Rooted in Ayurvedic tradition, Jayam’s Beauty Drops unites Moringa seed and rare Moringa root oils to revitalize the look of your skin — unveiling a natural, youthful-looking radiance.' },
      { title: 'Brightening power of sweet orange seed', body: 'Cold-pressed Sweet Orange seed oil helps skin look clearer and more balanced, for a visibly brighter, more even-looking complexion without heaviness.' },
      { title: 'Luxurious botanical base', body: 'Our signature plant emollients ensure fast absorption and a silky, non-greasy finish — leaving your skin soft, luminous, and deeply comforted.' },
      { title: 'Brightens, firms & smooths', body: 'Rich in antioxidants and essential fatty acids, this oil helps skin feel firmer and more supple, softens the appearance of fine lines and wrinkles, and promotes a healthy-looking, even skin tone. Antioxidants help defend skin against the visible effects of everyday environmental stress.' },
      { title: 'Multi-use ritual for all skin types', body: 'Use as a daily facial moisturizer, night treatment, or glow primer before makeup. Suitable for all skin types — crafted for balanced, radiant-looking skin.' },
      { title: 'Pure, potent & conscious', body: 'Formulated with 100% natural botanical oils. No paraffins, fillers, or artificial fragrance. Cruelty-free and sustainably sourced for mindful beauty.' },
    ],
    ingredients: 'Moringa root extract, Moringa seed oil, Sweet orange seed oil and virgin coconut oil. Ingredients sourced from India.',
    usageInstructions:
      'Apply a few drops to clean, dry skin. Gently massage into the face and neck until absorbed. Use morning and/or evening as part of your skincare routine.',
    warnings:
      'For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children. A patch test is recommended before first use.',
    disclaimer:
      'This is a cosmetic product intended for external use only. It is designed to support the appearance and feel of healthy-looking skin and is not intended to diagnose, treat, cure, or prevent any disease.',
    price: 34.88,
    productType: 'SKINCARE',
    category: 'Beauty & Facial Care',
    specs: [
      { name: 'Category', value: 'Beauty & Facial Care' },
      { name: 'Ingredients', value: 'Moringa root extract, Moringa seed oil, Sweet orange seed oil, Virgin coconut oil' },
      { name: 'Skin type', value: 'All skin types' },
      { name: 'Free from', value: 'Paraffins, fillers, artificial fragrance' },
      { name: 'Ingredient origin', value: 'India' },
      { name: 'Allergens', value: ALLERGENS },
      { name: 'Storage', value: 'Store in a cool, dry place away from direct sunlight and heat.' },
      { name: 'Shelf life', value: '3 years from the date of manufacture' },
      { name: 'Suitable for', value: 'Adults only' },
    ],
  },
];
