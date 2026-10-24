import { memo } from 'react';

// A moringa tree in the palette: a slender trunk that forks low into an open,
// umbrella-shaped crown of drooping feathery leaves, with soft volume behind the
// leaves, hanging drumstick pods and small white flower clusters.
//
// Performance: each leaf frond is drawn once as an SVG <symbol> and placed many times
// with <use>, so the tree is a few hundred elements instead of thousands, and it never
// re-renders on scroll (the page only scales it on the GPU).

function seeded(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Leaf shades from the palette's teal and sea green, darkest at the back
const BACK_GREENS = ['#2c6975', '#3f7c78', '#357371'];
const FRONT_GREENS = ['#4f8f80', '#5aa190', '#68b2a0', '#7dbca8', '#8fc5b0'];

// One bipinnate frond along +x that droops downwards: a rachis with paired pinnae,
// each carrying small oval leaflets, the way moringa leaves hang.
function frondLeaflets({ length, pinnae, reach }) {
  const leaflets = [];
  const point = (t) => [length * t, 34 * t * t - 8 * t];
  for (let i = 0; i < pinnae; i += 1) {
    const t = 0.14 + (i / (pinnae - 1)) * 0.8;
    const [px, py] = point(t);
    const along = Math.atan2(68 * t - 8, length);
    const pinnaLength = reach * (1 - t * 0.5);
    for (const side of [-1, 1]) {
      const angle = along + side * 1.0 + 0.3;
      for (let k = 1; k <= 3; k += 1) {
        const d = (k / 3.4) * pinnaLength;
        const lx = px + Math.cos(angle) * d;
        const ly = py + Math.sin(angle) * d;
        for (const leafSide of [-1, 1]) {
          const leafAngle = angle + leafSide * 1.15;
          leaflets.push([lx + Math.cos(leafAngle) * 3.4, ly + Math.sin(leafAngle) * 3.4, (leafAngle * 180) / Math.PI + 90]);
        }
      }
      leaflets.push([px + Math.cos(angle) * (pinnaLength + 2), py + Math.sin(angle) * (pinnaLength + 2), (angle * 180) / Math.PI + 90]);
    }
  }
  return { rachis: `M0 0 Q${(length * 0.5).toFixed(1)} -6 ${length} 26`, leaflets };
}

const FRONDS = {
  long: frondLeaflets({ length: 118, pinnae: 7, reach: 24 }),
  short: frondLeaflets({ length: 86, pinnae: 5, reach: 20 }),
};

// Branch tips and crown points the fronds hang from: [x, y, outward angle in degrees]
const ANCHORS = [
  [112, 272, 195], [128, 262, 230], [150, 300, 205], [160, 374, 185], [176, 318, 160],
  [206, 268, 250], [196, 300, 190], [232, 352, 205], [250, 300, 240],
  [338, 184, 280], [318, 214, 245], [348, 206, 305], [316, 262, 220], [390, 236, 320], [370, 258, 300],
  [282, 250, 260], [300, 228, 275],
  [500, 306, 345], [470, 320, 5], [440, 298, 310], [436, 344, 20], [462, 326, 330], [402, 372, 10], [420, 330, 300],
  [256, 380, 225], [356, 290, 285], [280, 330, 235],
];

function buildTree() {
  const random = seeded(11);
  const back = [];
  const front = [];

  ANCHORS.forEach(([x, y, angleDeg], index) => {
    const count = 3;
    for (let f = 0; f < count; f += 1) {
      const angle = angleDeg + (f - 1) * 30 + (random() - 0.5) * 18;
      const scale = 0.78 + random() * 0.4;
      // Leftward fronds are mirrored so they still droop downwards
      const leftward = Math.cos((angle * Math.PI) / 180) < 0;
      const frond = {
        key: `${index}-${f}`,
        kind: random() > 0.4 ? 'long' : 'short',
        transform: `translate(${x} ${y}) rotate(${angle.toFixed(1)}) scale(${scale.toFixed(2)} ${(leftward ? -scale : scale).toFixed(2)})`,
      };
      if (f === 1 && random() > 0.35) {
        back.push({ ...frond, color: BACK_GREENS[Math.floor(random() * BACK_GREENS.length)], opacity: 0.85 });
      } else {
        front.push({ ...frond, color: FRONT_GREENS[Math.floor(random() * FRONT_GREENS.length)], opacity: 0.88 + random() * 0.12 });
      }
    }
  });

  // Drumstick pods hang straight down from the limbs
  const pods = [[182, 330], [214, 358], [352, 262], [420, 340], [476, 318]].map(([x, y]) => {
    const length = 80 + random() * 50;
    const sway = (random() - 0.5) * 12;
    return `M${x} ${y} C${x + sway} ${y + length * 0.4} ${x - sway * 0.5} ${y + length * 0.75} ${x + sway * 0.3} ${y + length}`;
  });

  // Small white flower clusters near branch tips
  const flowers = [[120, 266], [205, 262], [340, 182], [392, 232], [498, 302], [442, 294]].map(([x, y]) => ({
    x,
    y,
    dots: Array.from({ length: 6 }, () => [x + (random() - 0.5) * 16, y + (random() - 0.5) * 12, 2.2 + random() * 1.6]),
  }));

  return { back, front, pods, flowers };
}

const TREE = buildTree();

// Volume behind the leaves, so the crown reads as one rounded canopy
const MASSES = [
  [170, 300, 100, 62], [330, 228, 112, 70], [452, 322, 92, 60], [262, 330, 120, 56], [392, 284, 96, 64],
];

const WOOD = [
  ['M291 478 C262 420 222 368 168 318 C148 300 130 284 112 272', 12],
  ['M292 474 C298 400 306 330 318 262 C324 228 330 204 338 184', 11],
  ['M294 486 C334 432 382 386 436 344 C458 328 478 316 500 306', 11],
  ['M240 392 C214 380 190 374 160 374', 5],
  ['M312 300 C344 280 366 260 390 236', 5],
  ['M402 372 C420 348 432 324 440 298', 4.5],
  ['M188 340 C190 312 196 290 206 268', 4.5],
  ['M300 360 C290 330 284 290 282 250', 4],
];

// `lite` (phones) skips the back layer and every other front frond: still a full crown
function MoringaTree({ className = '', lite = false }) {
  const front = lite ? TREE.front.filter((_, index) => index % 2 === 0) : TREE.front;

  return (
    <svg className={className} viewBox="-20 60 620 760" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mt-bark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#34504f" />
          <stop offset="0.45" stopColor="#6f8c8d" />
          <stop offset="1" stopColor="#2f4a4c" />
        </linearGradient>
        <radialGradient id="mt-mass" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#68b2a0" stopOpacity="0.38" />
          <stop offset="0.7" stopColor="#68b2a0" stopOpacity="0.14" />
          <stop offset="1" stopColor="#68b2a0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mt-ground" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2c6975" stopOpacity="0.25" />
          <stop offset="1" stopColor="#2c6975" stopOpacity="0" />
        </radialGradient>
        {Object.entries(FRONDS).map(([name, { rachis, leaflets }]) => (
          <symbol key={name} id={`mt-frond-${name}`} overflow="visible">
            <path d={rachis} stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.7" />
            {leaflets.map(([cx, cy, rotate], index) => (
              <ellipse key={index} cx={cx.toFixed(1)} cy={cy.toFixed(1)} rx="2.5" ry="4.4" fill="currentColor" transform={`rotate(${rotate.toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})`} />
            ))}
          </symbol>
        ))}
      </defs>

      <ellipse cx="300" cy="804" rx="150" ry="16" fill="url(#mt-ground)" />

      {/* Soft crown volume */}
      {MASSES.map(([cx, cy, rx, ry]) => <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#mt-mass)" />)}

      {/* Back leaves, darker */}
      {!lite && TREE.back.map(({ key, kind, transform, color, opacity }) => (
        <use key={key} href={`#mt-frond-${kind}`} transform={transform} color={color} opacity={opacity} />
      ))}

      {/* Trunk: tapered, with a slight flare at the base */}
      <path d="M280 806 C286 790 289 760 289 720 C289 640 286 580 284 530 C283 505 285 486 288 470 L300 470 C303 488 305 508 305 535 C305 610 306 690 309 750 C310 775 314 794 322 806 Z" fill="url(#mt-bark)" />
      {WOOD.map(([d, width]) => (
        <path key={d} d={d} stroke="url(#mt-bark)" strokeWidth={width} strokeLinecap="round" fill="none" />
      ))}

      {/* Drumstick pods */}
      {TREE.pods.map((d) => <path key={d} d={d} stroke="#3f7c78" strokeWidth="3" strokeLinecap="round" fill="none" />)}

      {/* Front leaves */}
      {front.map(({ key, kind, transform, color, opacity }) => (
        <use key={key} href={`#mt-frond-${kind}`} transform={transform} color={color} opacity={opacity} />
      ))}

      {/* Flower clusters */}
      {TREE.flowers.map(({ x, y, dots }) => (
        <g key={`${x}-${y}`}>
          {dots.map(([dx, dy, r], index) => (
            <circle key={index} cx={dx.toFixed(1)} cy={dy.toFixed(1)} r={r.toFixed(1)} fill="#ffffff" stroke="#cde0c9" strokeWidth="0.6" />
          ))}
        </g>
      ))}
    </svg>
  );
}

export default memo(MoringaTree);
