import { useEffect, useState } from 'react';
import axios from 'axios';

/*
 * Editable storefront text.
 * These defaults are what the site shows until someone edits the text in
 * Admin → Site content; saved edits are merged over them field by field.
 * Wellness copy follows U.S. structure/function wording: benefit lines that
 * describe support carry an asterisk tied to the FDA statement.
 */

export const HOME_DEFAULTS = {
  hero: {
    eyebrow: 'Organic moringa · Plant-based wellness',
    title: 'Small daily rituals.',
    sub: 'Rooted in nature. Made with nothing unnecessary.',
    primaryCta: 'Shop the collection',
    secondaryCta: 'Our story',
    sealRing: 'ORGANIC · VEGAN · NON-GMO · THIRD-PARTY TESTED · MADE WITH CARE · ',
  },
  showcase: {
    eyebrow: 'The collection',
    title: 'One tree.',
    accent: 'Five daily rituals.',
    sub: 'Every part of the moringa tree has its own story. Find the one written for you.',
    items: {
      'moringa-leaf-amla-tablets': {
        headline: 'Two superfoods. One daily ritual.',
        subtitle: 'Organic Moringa Leaf + Amla Tablets',
        description: 'Moringa leaf and Amla, a natural source of Vitamin C, together in one tablet to help support immune function, natural energy and digestion.*',
        badge: 'Bestseller',
      },
      'moringa-flower-tablets': {
        headline: 'Women’s daily botanical wellness',
        subtitle: 'Premium Organic Moringa Flower Tablets',
        description: 'Made from moringa flowers, not leaves — to help support hormonal balance, immunity, digestion and radiant-looking skin.*',
        badge: 'For her',
      },
      'moringa-seed-capsules': {
        headline: 'Everyday vitality for men',
        subtitle: 'Organic Moringa Seed Capsules',
        description: '500 mg of pure moringa seed in every capsule, to help support natural energy, stamina and an active, balanced life.*',
        badge: 'For him',
      },
      'moringa-leaf-capsules': {
        headline: 'Nature’s everyday superfood',
        subtitle: 'Organic Moringa Leaf Capsules',
        description: 'Pure Moringa oleifera leaf, naturally containing vitamins, minerals and antioxidants — the simplest place to start.*',
        badge: 'Start here',
      },
      'beauty-drops-moringa-facial-elixir': {
        headline: 'Ancient wisdom, modern glow',
        subtitle: 'Beauty Drops Facial Elixir',
        description: 'Moringa seed, rare moringa root and cold-pressed sweet orange seed oils for soft, radiant-looking skin. Absorbs without a greasy finish.',
        badge: 'Skincare',
      },
    },
  },
  plant: {
    eyebrow: 'Our difference',
    title: 'Nothing hidden.',
    accent: 'Nothing unnecessary.',
    intro: 'From farm to your hands, every step is intentional — clean ingredients, gentle processing and packaging that respects you and the planet.',
    // image: the card photo (replaceable from the admin panel later); empty shows the illustration
    steps: [
      { title: 'Organic botanicals', body: 'Moringa leaves, flowers and seeds, and Amla — carefully selected and sourced from India.', link: '/our-story', image: '/difference/botanicals.jpg' },
      { title: 'Gently vacuum-dried', body: 'A careful process that helps preserve naturally occurring nutrients and botanical character.', link: '/faq#products', image: '/difference/vacuum-dried.jpg' },
      { title: 'Made with care', body: 'Produced in GMP-certified facilities and third-party tested for purity.', link: '/faq#products', image: '/difference/made-with-care.jpg' },
      { title: 'Plastic-free packs', body: 'Biodegradable paper tubes that protect freshness — and the planet.', link: '/shop', image: '/difference/plastic-free.jpg' },
    ],
  },
  story: {
    eyebrow: 'Our story',
    title: 'It began with',
    accent: 'Moringa.',
    body: 'Jayam began with a simple belief: the things we choose for our health should be chosen with care. Every product is one we would be proud to place in the hands of our own families.',
    cta: 'Read our story',
  },
  final: {
    title: 'Begin your daily ritual.',
    sub: 'Free U.S. shipping on orders $49+ · Vegan · Non-GMO · Third-party tested',
    primaryCta: 'Shop all products',
    secondaryCta: 'Questions? Read the FAQ',
  },
};

// Product storytelling, told in five chapters that build on each other:
// who it is for → why you reach for it → what is inside → is it right for you → the promise.
export const STORY_DEFAULTS = {
  'moringa-leaf-amla-tablets': {
    lifestyle: {
      label: 'For the everyday all-rounder',
      title: 'For days that ask a lot of you.',
      body: 'Work, family, training, the commute — most days don’t leave room for complicated routines. Two traditionally valued superfoods in one small tablet make daily botanical support the easy part.',
      tags: ['Busy weekdays', 'Seasonal changes', 'Work and family', 'Travel'],
      word: 'BALANCE',
    },
    moments: {
      title: 'Why you’ll reach for it.',
      items: [
        { time: 'Morning', title: 'Start with support', body: 'One tablet with breakfast — moringa and Amla to help support natural energy for the day ahead.*' },
        { time: 'Through the day', title: 'Stay well, quietly', body: 'Amla is a natural source of Vitamin C to help support healthy immune function.*' },
        { time: 'Evening', title: 'Close the ritual', body: 'One tablet with dinner, to help support healthy digestion as part of your routine.*' },
      ],
    },
    about: {
      eyebrow: 'Meet the blend',
      title: 'Moringa leaf, meet Amla.',
      body: 'Moringa leaves and Amla — Indian gooseberry — have been valued in traditional wellness for generations. We vacuum-dry both gently to help keep their natural character, then press them together. Nothing else goes in.',
      facts: [
        { value: '2', unit: 'superfoods', label: 'organic Moringa leaf and Amla' },
        { value: '500', unit: 'mg', label: 'pure botanical per tablet' },
        { value: '120', unit: 'tablets', label: 'a full 2-month supply' },
      ],
    },
    fit: {
      title: 'Is it right for you?',
      forYou: ['You want one simple daily supplement, not five', 'You like plant-based, vegan and Non-GMO', 'You prefer formulas without fillers or binders', 'You want support for energy and immunity together*'],
      goodToKnow: ['For adults only', 'Take 2 tablets a day with food', 'Ask your healthcare provider first if you are pregnant, nursing or taking medication'],
    },
    promise: 'Two superfoods. One daily ritual. Nothing unnecessary.',
  },
  'moringa-flower-tablets': {
    lifestyle: {
      label: 'For women who look after everyone',
      title: 'Wellness made for her.',
      body: 'From your twenties onward, your body asks for different kinds of care. Moringa flowers are a rare, gentle botanical — chosen for women who want clean, plant-based balance in their everyday routine.',
      tags: ['Work and wellness', 'Self-care rituals', 'Every life stage', 'Active days'],
      word: 'BLOOM',
    },
    moments: {
      title: 'Why you’ll reach for it.',
      items: [
        { time: 'Morning', title: 'Feel balanced', body: 'One tablet with breakfast to help support healthy hormonal balance through your day.*' },
        { time: 'Inside out', title: 'Glow from within', body: 'Moringa flowers naturally contain Omega 3, 6 and 9 to help nourish skin and hair.*' },
        { time: 'Evening', title: 'Support your system', body: 'One tablet with dinner, to help support digestion and immune function.*' },
      ],
    },
    about: {
      eyebrow: 'Meet the flower',
      title: 'Not the leaf. The flower.',
      body: 'Most moringa supplements are made from leaves. We chose the delicate flowers instead — hand-harvested, gently vacuum-dried, and pressed into a tablet with nothing added.',
      facts: [
        { value: '1', unit: 'ingredient', label: 'organic moringa flowers' },
        { value: '3', unit: 'omegas', label: 'naturally occurring 3, 6 and 9' },
        { value: '0', unit: '', label: 'fillers, binders or preservatives' },
      ],
    },
    fit: {
      title: 'Is it right for you?',
      forYou: ['You are a woman aged 20 or over', 'You want clean, single-ingredient support', 'You care about skin and hair from within*', 'You prefer vegan and Non-GMO'],
      goodToKnow: ['For adults only', 'Take 2 tablets a day with food', 'Ask your healthcare provider first if you are pregnant, nursing or taking medication'],
    },
    promise: 'Nature’s goodness, made for women’s wellness.',
  },
  'moringa-seed-capsules': {
    lifestyle: {
      label: 'For the active man',
      title: 'Built for the days you push.',
      body: 'Early training, long hours, weekends outdoors. Moringa seed is the most concentrated part of the tree — a clean, caffeine-free way for men to support the energy an active life needs.*',
      tags: ['Training days', 'Long workdays', 'Outdoors', 'Recovery'],
      word: 'VITALITY',
    },
    moments: {
      title: 'Why you’ll reach for it.',
      items: [
        { time: 'Morning', title: 'Natural energy', body: 'Help support stamina and focus without caffeine.*' },
        { time: 'After activity', title: 'Move comfortably', body: 'Plant compounds that help support joint comfort and healthy recovery.*' },
        { time: 'Every day', title: 'Stay resilient', body: 'Antioxidants and amino acids to help support immune function and overall wellness.*' },
      ],
    },
    about: {
      eyebrow: 'Meet the seed',
      title: 'Only the seed. Nothing else.',
      body: 'Many moringa supplements blend leaves and fillers. Ours are 100% organic moringa seed, hand-harvested and dry vacuum extracted — one powerful ingredient, done right.',
      facts: [
        { value: '100', unit: '%', label: 'pure organic moringa seed' },
        { value: '500', unit: 'mg', label: 'per capsule' },
        { value: '0', unit: '', label: 'caffeine, fillers or starch coatings' },
      ],
    },
    fit: {
      title: 'Is it right for you?',
      forYou: ['You lead an active, demanding life', 'You want caffeine-free daily support*', 'You prefer a single, pure ingredient', 'You value vegan, Non-GMO formulas'],
      goodToKnow: ['For adults only', 'Take 2 capsules a day with food', 'Ask your healthcare provider first if you are taking medication'],
    },
    promise: 'Pure nature. Everyday vitality.',
  },
  'moringa-leaf-capsules': {
    lifestyle: {
      label: 'For anyone starting out',
      title: 'Your first daily ritual.',
      body: 'New to moringa? Start with the leaf — the part of the tree people have trusted longest. Two capsules a day is all it takes to bring a green superfood into your routine.',
      tags: ['New routines', 'Plant-based eating', 'Busy mornings', 'Everyday wellness'],
      word: 'GREEN',
    },
    moments: {
      title: 'Why you’ll reach for it.',
      items: [
        { time: 'Morning', title: 'Green, without the blender', body: 'Leaf nutrition in a capsule — no powders or shakes to prepare.*' },
        { time: 'Through the day', title: 'Steady energy', body: 'Naturally occurring vitamins and minerals to help support natural energy.*' },
        { time: 'Evening', title: 'Easy on routine', body: 'One capsule with dinner, to help support healthy digestion.*' },
      ],
    },
    about: {
      eyebrow: 'Meet the leaf',
      title: 'The superfood, simplified.',
      body: 'Carefully selected organic Moringa oleifera leaves, gently vacuum-dried to help preserve their natural nutrients, then filled into capsules. No coatings, colors or fillers.',
      facts: [
        { value: '500', unit: 'mg', label: 'pure moringa leaf per capsule' },
        { value: '2', unit: 'a day', label: 'morning and evening, with food' },
        { value: '60', unit: 'days', label: 'in every pack' },
      ],
    },
    fit: {
      title: 'Is it right for you?',
      forYou: ['You are new to botanical supplements', 'You want a simple, affordable start', 'You eat plant-based or want more greens', 'You like clean, single-ingredient formulas'],
      goodToKnow: ['For adults only', 'Take 2 capsules a day with food', 'Ask your healthcare provider first if you are pregnant, nursing or taking medication'],
    },
    promise: 'Nature’s everyday superfood, made simple.',
  },
  'beauty-drops-moringa-facial-elixir': {
    lifestyle: {
      label: 'For the mindful skincare ritual',
      title: 'Three drops. A softer glow.',
      body: 'Skincare doesn’t need ten steps. Inspired by Ayurvedic beauty rituals, Beauty Drops is one light facial oil for mornings, nights, or a glow before makeup.',
      tags: ['Morning glow', 'Night ritual', 'Before makeup', 'All skin types'],
      word: 'GLOW',
    },
    moments: {
      title: 'Why you’ll reach for it.',
      items: [
        { time: 'Morning', title: 'A natural glow', body: 'A few drops under makeup for a smooth, radiant-looking finish.' },
        { time: 'Daytime', title: 'Soft, never greasy', body: 'Absorbs quickly and leaves skin feeling soft and comfortable.' },
        { time: 'Night', title: 'Nourish while you rest', body: 'Use as a night moisturizer for supple, refreshed-looking skin by morning.' },
      ],
    },
    about: {
      eyebrow: 'Meet the oils',
      title: 'Moringa seed, rare moringa root, sweet orange.',
      body: 'Three botanical oils, rich in naturally occurring fatty acids and antioxidants, blended with virgin coconut oil. No paraffins, fillers or artificial fragrance — and never tested on animals.',
      facts: [
        { value: '100', unit: '%', label: 'natural botanical oils' },
        { value: '3', unit: 'oils', label: 'moringa seed, moringa root, sweet orange' },
        { value: '0', unit: '', label: 'paraffins or artificial fragrance' },
      ],
    },
    fit: {
      title: 'Is it right for you?',
      forYou: ['You want one oil that does more', 'Your skin feels dry, dull or tired-looking', 'You prefer natural, cruelty-free beauty', 'You dislike heavy, greasy finishes'],
      goodToKnow: ['For external use only', 'Avoid contact with eyes', 'Patch test before first use'],
    },
    promise: 'Ancient wisdom. Modern glow.',
  },
};

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Saved edits win field by field; anything not saved falls back to the default
export function mergeContent(defaults, saved) {
  if (!isObject(defaults)) return saved === undefined || saved === null ? defaults : saved;
  const result = { ...defaults };
  if (!isObject(saved)) return result;
  Object.keys(saved).forEach((key) => {
    result[key] = key in defaults ? mergeContent(defaults[key], saved[key]) : saved[key];
  });
  return result;
}

const DEFAULTS = { home: HOME_DEFAULTS, 'product-stories': STORY_DEFAULTS };
const cache = {};

export function loadContent(key, { fresh = false } = {}) {
  if (!cache[key] || fresh) {
    cache[key] = axios.get(`${import.meta.env.VITE_API_URL}/api/content/${key}`)
      .then(({ data }) => data?.data || {})
      .catch(() => {
        delete cache[key];
        return {};
      });
  }
  return cache[key];
}

export function forgetContent(key) {
  delete cache[key];
}

// Defaults render at once; saved text replaces them when it arrives
export function useSiteContent(key) {
  const [content, setContent] = useState(DEFAULTS[key]);
  useEffect(() => {
    let active = true;
    loadContent(key).then((saved) => {
      if (active) setContent(mergeContent(DEFAULTS[key], saved));
    });
    return () => { active = false; };
  }, [key]);
  return content;
}
