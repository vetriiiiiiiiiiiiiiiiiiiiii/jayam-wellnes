// The 12 health benefits a product can show as icons under its hero photos.
// Admin → Products → Product story picks which ones each product shows (saved as keys in
// story.benefits). The wording is kept to supplement "structure/function" language, so
// the ones marked * show with the FDA statement.

const Svg = ({ children }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const BENEFITS = [
  {
    key: 'fitness-skin',
    label: 'Maintains overall fitness & skin health*',
    icon: (
      <Svg>
        <path d="M18 6c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9z" />
        <path d="M35 6c.5 3 1.5 4 4.5 4.5-3 .5-4 1.5-4.5 4.5-.5-3-1.5-4-4.5-4.5 3-.5 4-1.5 4.5-4.5z" />
        <path d="M6 33c4-3 8 3 12 0s8 3 12 0 8 3 12 0" />
        <path d="M6 40h36" />
      </Svg>
    ),
  },
  {
    key: 'hair',
    label: 'Supports hair growth*',
    icon: (
      <Svg>
        <path d="M24 37c-3-9-2-21 6-31" />
        <path d="M5 37h11M32 37h11" />
        <path d="M16 37c0 4 3.5 6.5 8 6.5s8-2.5 8-6.5" />
        <circle cx="9" cy="42" r="1.4" />
        <circle cx="39" cy="42" r="1.4" />
      </Svg>
    ),
  },
  {
    key: 'protein-omega',
    label: 'Source of protein & Omega 3, 6 & 9',
    icon: (
      <Svg>
        <path d="M24 5c7.5 9 12.5 15.5 12.5 22.5a12.5 12.5 0 0 1-25 0C11.5 20.5 16.5 14 24 5z" />
        <path d="M18 35h4.5v-2.6a5.5 5.5 0 1 1 3 0V35H30" />
      </Svg>
    ),
  },
  {
    key: 'metabolism',
    label: 'Supports a healthy metabolism*',
    icon: (
      <Svg>
        <path d="M27 4 11 27h12l-2 17 16-24H25z" />
      </Svg>
    ),
  },
  {
    key: 'antioxidants',
    label: 'Antioxidant support*',
    icon: (
      <Svg>
        <path d="m24 13 9.5 5.5v11L24 35l-9.5-5.5v-11z" />
        <circle cx="24" cy="24" r="4" />
        <path d="M24 13V8M33.5 18.5l4.5-2.5M33.5 29.5l4.5 2.5M24 35v5M14.5 29.5 10 32M14.5 18.5 10 16" />
        <circle cx="24" cy="5.5" r="2.2" />
        <circle cx="40.2" cy="14.8" r="2.2" />
        <circle cx="40.2" cy="33.2" r="2.2" />
        <circle cx="24" cy="42.5" r="2.2" />
        <circle cx="7.8" cy="33.2" r="2.2" />
        <circle cx="7.8" cy="14.8" r="2.2" />
      </Svg>
    ),
  },
  {
    key: 'wellness',
    label: 'Supports overall wellness*',
    icon: (
      <Svg>
        <circle cx="24" cy="12" r="6.5" />
        <path d="M9 43c0-8.5 6.5-14 15-14s15 5.5 15 14" />
        <path d="M24 41c-3.2-2-5.2-3.6-5.2-6a2.7 2.7 0 0 1 5.2-1 2.7 2.7 0 0 1 5.2 1c0 2.4-2 4-5.2 6z" />
      </Svg>
    ),
  },
  {
    key: 'hemoglobin',
    label: 'Supports healthy hemoglobin levels*',
    icon: (
      <Svg>
        <path d="M18 7c6.5 8 10.5 13.5 10.5 19.5a10.5 10.5 0 0 1-21 0C7.5 20.5 11.5 15 18 7z" />
        <path d="M14 29a4.5 4.5 0 0 0 4 4" />
        <path d="M38 41V13M32 19l6-6 6 6" />
      </Svg>
    ),
  },
  {
    key: 'aging',
    label: 'Helps reduce visible signs of aging*',
    icon: (
      <Svg>
        <path d="M11 6h20M11 42h20" />
        <path d="M13.5 6c0 9 7.5 11 7.5 18s-7.5 9-7.5 18M28.5 6c0 9-7.5 11-7.5 18s7.5 9 7.5 18" />
        <path d="M16.5 38h9" />
        <path d="M40 16c.5 3 1.5 4 4.5 4.5-3 .5-4 1.5-4.5 4.5-.5-3-1.5-4-4.5-4.5 3-.5 4-1.5 4.5-4.5z" />
      </Svg>
    ),
  },
  {
    key: 'immunity',
    label: 'Supports immune function*',
    icon: (
      <Svg>
        <path d="M24 5 39 11v11c0 10-6 17-15 21C15 39 9 32 9 22V11z" />
        <path d="m17 24 5 5 9-10" />
      </Svg>
    ),
  },
  {
    key: 'menstrual',
    label: 'Supports menstrual comfort for women*',
    icon: (
      <Svg>
        <path d="M38.5 19A15.5 15.5 0 0 0 11 13.5" />
        <path d="M10 7v7h7" />
        <path d="M9.5 29A15.5 15.5 0 0 0 37 34.5" />
        <path d="M38 41v-7h-7" />
        <path d="M24 15c3.5 4.5 5.5 7.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-3 2-6 5.5-10.5z" />
      </Svg>
    ),
  },
  {
    key: 'blood-sugar',
    label: 'Supports healthy blood sugar levels*',
    icon: (
      <Svg>
        <path d="M16.5 7c5 7 9 12 9 17.5a9 9 0 0 1-18 0c0-5.5 4-10.5 9-17.5z" />
        <path d="M13.5 25h6M16.5 22v6" />
        <path d="M33.5 16c4.5 6 7.5 10 7.5 14.5a7.5 7.5 0 0 1-15 0c0-4.5 3-8.5 7.5-14.5z" />
        <path d="M30.5 31h6" />
      </Svg>
    ),
  },
  {
    key: 'digestion',
    label: 'Aids healthy digestion*',
    icon: (
      <Svg>
        <path d="M18 4v7c0 4-8 6-8 16 0 8 6 14 15 14 8 0 15-5 15-13 0-6-4-10-9-10-4 0-6 3-7 5" />
        <path d="M24 41v4" />
        <path d="M20 29c1.5 2 4 3 6.5 2.5" />
      </Svg>
    ),
  },
];

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
