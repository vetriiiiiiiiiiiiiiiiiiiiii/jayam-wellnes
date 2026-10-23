import { useId } from 'react';

// Illustrated Jayam packaging, used until real product photos are added:
// supplements come in a paper tube, Beauty Drops in a tinted glass dropper bottle.
// Colours come from the client palette: teal #2C6975, sea #68B2A0, sage #CDE0C9, mist #E0ECDE.

const TEAL = '#2c6975';
const SEA = '#68b2a0';
const SHADE = '#1d4750'; // teal in shadow, for the roundness shading

const PALETTES = {
  'moringa-leaf-amla-tablets': { body: TEAL, cap: SEA, accent: TEAL },
  'moringa-leaf-capsules': { body: SEA, cap: TEAL, accent: TEAL },
  'moringa-flower-tablets': { body: '#e0ecde', cap: SEA, accent: TEAL },
  'moringa-seed-capsules': { body: '#cde0c9', cap: TEAL, accent: TEAL },
};
const DEFAULT_PALETTE = { body: '#cde0c9', cap: TEAL, accent: TEAL };

const SERIF = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif";

// Greedy line wrap so long names fit the label
function wrap(text, max) {
  const lines = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last && `${last} ${word}`.length <= max) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

function LeafMark({ x, y, color }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round">
      <path d="M-5 4 C-5 -3 1 -6 6 -6 C6 0 3 5 -4 5 Z" />
      <path d="M-5 5 L2 -2" />
    </g>
  );
}

function Shadow({ id, cx, cy, rx }) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={SHADE} stopOpacity="0.28" />
          <stop offset="1" stopColor={SHADE} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry="14" fill={`url(#${id}-shadow)`} />
    </>
  );
}

function Tube({ id, title, form, meta, organic, palette }) {
  const titleLines = wrap(title, 12);
  const twoLines = titleLines.length > 1;
  const titleStart = twoLines ? 182 : 192;
  const lineHeight = twoLines ? 17 : 18;
  const body = 'M72 80 L72 292 A58 13 0 0 0 188 292 L188 80 Z';
  const cap = 'M70 50 L70 86 A60 13 0 0 0 190 86 L190 50 Z';
  const label = 'M72 128 A58 13 0 0 0 188 128 L188 262 A58 13 0 0 1 72 262 Z';

  return (
    <>
      <defs>
        <linearGradient id={`${id}-round`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={SHADE} stopOpacity="0.32" />
          <stop offset="0.22" stopColor={SHADE} stopOpacity="0" />
          <stop offset="0.34" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="0.46" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.8" stopColor={SHADE} stopOpacity="0.08" />
          <stop offset="1" stopColor={SHADE} stopOpacity="0.34" />
        </linearGradient>
        <linearGradient id={`${id}-paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <Shadow id={id} cx="130" cy="300" rx="78" />

      {/* Tube body (kraft-paper colour) */}
      <path d={body} fill={palette.body} />
      <path d={body} fill={`url(#${id}-paper)`} />

      {/* Wrap-around label */}
      <path d={label} fill="#ffffff" />
      <path d="M72 136 A58 13 0 0 0 188 136" stroke={palette.accent} strokeOpacity="0.35" fill="none" />
      <path d="M72 254 A58 13 0 0 0 188 254" stroke={palette.accent} strokeOpacity="0.35" fill="none" />

      <LeafMark x={130} y={148} color={palette.accent} />
      <text x="130" y="164" textAnchor="middle" fontFamily={SANS} fontSize="8.5" fontWeight="700" letterSpacing="3" fill={palette.accent}>
        JAYAM
      </text>
      {titleLines.map((line, index) => (
        <text key={line} x="130" y={titleStart + index * lineHeight} textAnchor="middle" fontFamily={SERIF} fontSize={twoLines ? 16 : 17} fill={TEAL}>
          {line}
        </text>
      ))}
      {form && (
        <text x="130" y={titleStart + titleLines.length * lineHeight} textAnchor="middle" fontFamily={SERIF} fontSize="12.5" fill={SEA}>
          {form}
        </text>
      )}
      {organic && (
        <text x="130" y="234" textAnchor="middle" fontFamily={SANS} fontSize="6.5" fontWeight="700" letterSpacing="1.6" fill={palette.accent}>
          ORGANIC
        </text>
      )}
      {meta && (
        <text x="130" y="245" textAnchor="middle" fontFamily={SANS} fontSize="6.5" fontWeight="600" letterSpacing="1.1" fill={TEAL} opacity="0.7">
          {meta.toUpperCase()}
        </text>
      )}

      {/* Cap */}
      <path d={cap} fill={palette.cap} />
      <ellipse cx="130" cy="50" rx="60" ry="13" fill={palette.cap} />
      <ellipse cx="130" cy="50" rx="60" ry="13" fill="#ffffff" opacity="0.14" />

      {/* Roundness: shading over body, label and cap */}
      <path d={body} fill={`url(#${id}-round)`} />
      <path d={cap} fill={`url(#${id}-round)`} />
    </>
  );
}

function DropperBottle({ id, title, form }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={SHADE} />
          <stop offset="0.3" stopColor={TEAL} />
          <stop offset="0.45" stopColor={SEA} />
          <stop offset="1" stopColor={SHADE} />
        </linearGradient>
        <linearGradient id={`${id}-bulb`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={SHADE} />
          <stop offset="0.35" stopColor={TEAL} />
          <stop offset="1" stopColor={SHADE} />
        </linearGradient>
      </defs>

      <Shadow id={id} cx="130" cy="300" rx="68" />

      {/* Glass bottle with shoulders */}
      <path d="M84 168 C84 150 100 144 112 140 L112 124 L148 124 L148 140 C160 144 176 150 176 168 L176 278 C176 290 168 296 156 296 L104 296 C92 296 84 290 84 278 Z" fill={`url(#${id}-glass)`} />
      <rect x="94" y="170" width="7" height="104" rx="3.5" fill="#ffffff" opacity="0.28" />

      {/* Label */}
      <rect x="84" y="192" width="92" height="74" fill="#ffffff" />
      <LeafMark x={130} y={206} color={SEA} />
      <text x="130" y="222" textAnchor="middle" fontFamily={SANS} fontSize="7" fontWeight="700" letterSpacing="2.4" fill={SEA}>JAYAM</text>
      <text x="130" y="241" textAnchor="middle" fontFamily={SERIF} fontSize="15" fill={TEAL}>{title}</text>
      {form && <text x="130" y="256" textAnchor="middle" fontFamily={SERIF} fontSize="10.5" fill={SEA}>{form}</text>}

      {/* Collar and dropper bulb */}
      <rect x="104" y="100" width="52" height="28" rx="5" fill={`url(#${id}-bulb)`} />
      <path d="M114 100 L114 66 C114 48 146 48 146 66 L146 100 Z" fill={`url(#${id}-bulb)`} />
      <rect x="104" y="112" width="52" height="3" fill="#ffffff" opacity="0.12" />
    </>
  );
}

export default function ProductPack({ product, title, form, meta, organic }) {
  const id = `pack${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const isSkincare = product.productType === 'SKINCARE';
  const palette = PALETTES[product.slug] || DEFAULT_PALETTE;

  return (
    <svg className="jayam-pack" viewBox="0 0 260 320" aria-hidden="true" focusable="false">
      {isSkincare
        ? <DropperBottle id={id} title={title} form={form} />
        : <Tube id={id} title={title} form={form} meta={meta} organic={organic} palette={palette} />}
    </svg>
  );
}
