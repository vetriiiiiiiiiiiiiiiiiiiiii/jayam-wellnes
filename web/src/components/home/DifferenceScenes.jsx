import { useId } from 'react';

// Small illustrated scenes for the "Our difference" cards, drawn in the palette:
// leaves in a wooden bowl, moringa powder with drifting dust, a petri dish under a
// dropper, and a Jayam paper tube among leaves. Seeded layouts keep them stable.

function seeded(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const GREENS = ['#3f7c78', '#4f8f80', '#5aa190', '#68b2a0', '#7dbca8', '#2c6975'];

// A single leaf, pointing along +x, with a midrib
function Leaf({ x, y, size, angle, fill, rib = 'rgba(255,255,255,0.35)' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}>
      <path d="M0 0 C7 -9 20 -9 28 0 C20 9 7 9 0 0 Z" fill={fill} />
      <path d="M1 0 L26 0" stroke={rib} strokeWidth="0.8" />
    </g>
  );
}

function Bokeh({ items }) {
  return items.map(([cx, cy, r, opacity], index) => <circle key={index} cx={cx} cy={cy} r={r} fill="#ffffff" opacity={opacity} />);
}

function Bowl({ id, light = false }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={light ? '#9a8064' : '#6f5641'} />
          <stop offset="0.45" stopColor={light ? '#c4a684' : '#9a7a5c'} />
          <stop offset="1" stopColor={light ? '#8a6f55' : '#5c4532'} />
        </linearGradient>
        <radialGradient id={`${id}-bowl-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000000" stopOpacity="0.28" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="236" rx="120" ry="16" fill={`url(#${id}-bowl-shadow)`} />
      <path d="M58 176 Q64 232 160 234 Q256 232 262 176 Z" fill={`url(#${id}-wood)`} />
      <ellipse cx="160" cy="176" rx="102" ry="20" fill={light ? '#b8997a' : '#82654c'} />
      <path d="M70 186 Q160 206 250 186" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="3" fill="none" />
    </>
  );
}

const botanicals = (() => {
  const random = seeded(3);
  const leaves = [];
  for (let i = 0; i < 46; i += 1) {
    const t = random();
    const x = 72 + t * 176;
    const dome = Math.sin(t * Math.PI);
    const y = 178 - dome * (38 + random() * 26) + random() * 10;
    leaves.push({ x, y, size: 0.9 + random() * 0.7, angle: -160 + random() * 140, fill: GREENS[Math.floor(random() * GREENS.length)] });
  }
  return leaves;
})();

export function BotanicalsScene() {
  const id = `od${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 320 250" aria-hidden="true" focusable="false">
      <Bokeh items={[[40, 40, 38, 0.06], [270, 30, 26, 0.08], [230, 90, 50, 0.05], [80, 110, 18, 0.07]]} />
      <Bowl id={id} />
      {botanicals.map((leaf, index) => <Leaf key={index} {...leaf} />)}
      <Leaf x={34} y={222} size={1.4} angle={-20} fill="#4f8f80" />
      <Leaf x={270} y={230} size={1.2} angle={200} fill="#68b2a0" />
    </svg>
  );
}

const dust = (() => {
  const random = seeded(9);
  return Array.from({ length: 90 }, () => {
    const t = random();
    return [150 + t * 150 + (random() - 0.5) * 40, 120 - t * 110 + (random() - 0.5) * 40, 0.6 + random() * 1.8, 0.15 + (1 - t) * 0.55];
  });
})();

export function PowderScene() {
  const id = `od${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 320 250" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-powder`} cx="0.45" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#9ccfae" />
          <stop offset="0.55" stopColor="#6fae8f" />
          <stop offset="1" stopColor="#4d8f78" />
        </radialGradient>
      </defs>
      <Bokeh items={[[60, 50, 40, 0.35], [250, 40, 30, 0.3]]} />
      <Bowl id={id} light />
      <path d="M80 178 C110 150 132 104 160 100 C190 104 212 150 240 178 Z" fill={`url(#${id}-powder)`} />
      <path d="M128 132 C140 118 152 108 162 106" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" fill="none" />
      {dust.map(([cx, cy, r, opacity], index) => <circle key={index} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={r.toFixed(1)} fill="#6fae8f" opacity={opacity.toFixed(2)} />)}
      <Leaf x={250} y={120} size={2.2} angle={-30} fill="#4f8f80" />
      <Leaf x={262} y={150} size={1.6} angle={10} fill="#68b2a0" />
    </svg>
  );
}

export function LabScene() {
  const id = `od${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 320 250" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id={`${id}-liquid`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#cde0c9" stopOpacity="0.35" />
          <stop offset="1" stopColor="#cde0c9" stopOpacity="0.05" />
        </radialGradient>
      </defs>
      {/* Lab glass in the background */}
      <path d="M40 20 L40 70 L18 120 L78 120 L56 70 L56 20" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" fill="none" />
      <rect x="250" y="10" width="34" height="110" rx="6" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" fill="none" />
      {/* Petri dish */}
      <ellipse cx="150" cy="206" rx="112" ry="26" fill="#000000" opacity="0.22" />
      <ellipse cx="150" cy="190" rx="108" ry="28" fill={`url(#${id}-liquid)`} stroke="#ffffff" strokeOpacity="0.45" strokeWidth="2" />
      <ellipse cx="150" cy="186" rx="96" ry="22" stroke="#ffffff" strokeOpacity="0.25" fill="none" />
      <path d="M62 196 Q150 222 238 196" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2" fill="none" />
      <Leaf x={112} y={186} size={2.4} angle={-12} fill="#68b2a0" />
      <Leaf x={150} y={192} size={1.5} angle={22} fill="#4f8f80" />
      {/* Dropper */}
      <g transform="translate(250 30) rotate(32)">
        <rect x="-7" y="0" width="14" height="110" rx="5" fill={`url(#${id}-glass)`} stroke="#ffffff" strokeOpacity="0.5" />
        <path d="M-5 110 L0 132 L5 110 Z" fill="#ffffff" opacity="0.55" />
        <rect x="-10" y="-34" width="20" height="38" rx="9" fill="#e0ecde" opacity="0.9" />
      </g>
      <circle cx="178" cy="160" r="4" fill="#cde0c9" opacity="0.9" />
    </svg>
  );
}

export function PaperTubeScene() {
  const id = `od${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 320 250" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-tube`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9fc0a6" />
          <stop offset="0.4" stopColor="#d8e8d4" />
          <stop offset="1" stopColor="#8fb39a" />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1d4750" />
          <stop offset="0.45" stopColor="#2c6975" />
          <stop offset="1" stopColor="#1d4750" />
        </linearGradient>
        <radialGradient id={`${id}-floor`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2c6975" stopOpacity="0.25" />
          <stop offset="1" stopColor="#2c6975" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="232" rx="110" ry="14" fill={`url(#${id}-floor)`} />
      {/* A second, shorter tube behind */}
      <rect x="236" y="92" width="62" height="136" rx="4" fill={`url(#${id}-tube)`} opacity="0.85" />
      <ellipse cx="267" cy="92" rx="31" ry="8" fill="#cde0c9" />
      {/* The Jayam paper tube */}
      <rect x="150" y="54" width="86" height="176" rx="5" fill={`url(#${id}-tube)`} />
      <rect x="150" y="104" width="86" height="72" fill="#ffffff" opacity="0.92" />
      <text x="193" y="132" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="2.5" fill="#2c6975">JAYAM</text>
      <text x="193" y="150" textAnchor="middle" fontSize="8" fill="#68b2a0">Moringa</text>
      <rect x="146" y="36" width="94" height="28" rx="5" fill={`url(#${id}-cap)`} />
      <ellipse cx="193" cy="36" rx="47" ry="9" fill="#3d8580" />
      {/* Leaves */}
      <Leaf x={60} y={196} size={2.6} angle={-28} fill="#4f8f80" />
      <Leaf x={92} y={226} size={2} angle={-6} fill="#68b2a0" />
      <Leaf x={112} y={160} size={1.8} angle={-60} fill="#3f7c78" />
      <Leaf x={250} y={214} size={1.4} angle={-170} fill="#5aa190" />
    </svg>
  );
}

export const SCENES = [BotanicalsScene, PowderScene, LabScene, PaperTubeScene];
