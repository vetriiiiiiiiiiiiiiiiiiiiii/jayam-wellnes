import { memo } from 'react';

// A botanically faithful moringa tree, drawn procedurally:
// slender pale trunk that forks low, an open umbrella crown of drooping
// bipinnate leaves (many tiny oval leaflets), hanging drumstick pods and
// small cream flower clusters. Seeded randomness keeps it natural but stable.
// The canopy fades in frond by frond from the CSS variable --p (0 → 1) set on a parent,
// so scrolling never re-renders the thousands of leaflets.

function seeded(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Leaf shades drawn from the palette's teal and sea green
const LEAF_GREENS = ['#4f8f80', '#5aa190', '#68b2a0', '#7dbca8', '#3f7c78', '#8fc5b0'];

// Trunk and limbs as tapered strokes: [path, width]
const WOOD = [
  ['M300 800 C298 720 304 640 296 560 C291 515 292 490 290 470', 20],
  ['M291 478 C262 420 222 368 168 318 C148 300 130 284 112 272', 13],
  ['M292 474 C298 400 306 330 318 262 C324 228 330 204 338 184', 12],
  ['M294 486 C334 432 382 386 436 344 C458 328 478 316 500 306', 12],
  ['M240 392 C214 380 190 374 160 374', 6],
  ['M312 300 C344 280 366 260 390 236', 6],
  ['M402 372 C420 348 432 324 440 298', 5],
  ['M188 340 C190 312 196 290 206 268', 5],
];

// Where leaf fronds attach: [x, y, outward angle in degrees]
const ANCHORS = [
  [112, 272, 200], [130, 284, 165], [150, 300, 215], [160, 374, 190], [168, 318, 150],
  [206, 268, 245], [196, 296, 185], [230, 352, 205],
  [338, 184, 275], [326, 222, 235], [330, 210, 305], [316, 262, 215], [390, 236, 320], [366, 258, 300],
  [500, 306, 345], [470, 320, 10], [440, 298, 300], [436, 344, 20], [460, 326, 330], [402, 372, 15],
  [256, 380, 230], [300, 300, 250], [356, 270, 280], [280, 330, 240], [420, 330, 300],
];

function buildTree() {
  const random = seeded(7);
  const fronds = [];

  ANCHORS.forEach(([x, y, angleDeg], index) => {
    // Two or three fronds per anchor, fanning out, each drooping under its own weight
    const count = 2 + Math.floor(random() * 2);
    for (let f = 0; f < count; f += 1) {
      const angle = ((angleDeg + (f - (count - 1) / 2) * 34 + (random() - 0.5) * 20) * Math.PI) / 180;
      const length = 70 + random() * 55;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const control = [x + dx * length * 0.55, y + dy * length * 0.55 - 18];
      const end = [x + dx * length * 0.95, y + Math.max(dy, -0.2) * length * 0.4 + length * 0.42];

      const point = (t) => [
        (1 - t) ** 2 * x + 2 * (1 - t) * t * control[0] + t ** 2 * end[0],
        (1 - t) ** 2 * y + 2 * (1 - t) * t * control[1] + t ** 2 * end[1],
      ];
      const tangent = (t) => [
        2 * (1 - t) * (control[0] - x) + 2 * t * (end[0] - control[0]),
        2 * (1 - t) * (control[1] - y) + 2 * t * (end[1] - control[1]),
      ];

      const leaflets = [];
      const pinnaPairs = 5 + Math.floor(random() * 3);
      for (let i = 0; i < pinnaPairs; i += 1) {
        const t = 0.18 + (i / pinnaPairs) * 0.8;
        const [px, py] = point(t);
        const [tx, ty] = tangent(t);
        const along = Math.atan2(ty, tx);
        const pinnaLength = (18 + random() * 8) * (1 - t * 0.45);
        for (const side of [-1, 1]) {
          // Each pinna droops slightly, carrying small paired oval leaflets
          const pAngle = along + side * (1.05 + random() * 0.25) + 0.25;
          for (let k = 1; k <= 2; k += 1) {
            const d = (k / 2.4) * pinnaLength;
            const lx = px + Math.cos(pAngle) * d;
            const ly = py + Math.sin(pAngle) * d;
            for (const leafSide of [-1, 1]) {
              const leafAngle = pAngle + leafSide * 1.2;
              leaflets.push({
                cx: lx + Math.cos(leafAngle) * 3.2,
                cy: ly + Math.sin(leafAngle) * 3.2,
                rotate: (leafAngle * 180) / Math.PI + 90,
                rx: 2.4 + random() * 1,
                ry: 4.2 + random() * 1.6,
                fill: LEAF_GREENS[Math.floor(random() * LEAF_GREENS.length)],
                opacity: 0.78 + random() * 0.22,
              });
            }
          }
          leaflets.push({
            cx: px + Math.cos(pAngle) * (pinnaLength + 3),
            cy: py + Math.sin(pAngle) * (pinnaLength + 3),
            rotate: (pAngle * 180) / Math.PI + 90,
            rx: 2.6,
            ry: 4.6,
            fill: LEAF_GREENS[Math.floor(random() * LEAF_GREENS.length)],
            opacity: 0.9,
          });
        }
      }

      fronds.push({
        key: `${index}-${f}`,
        rachis: `M${x} ${y} Q${control[0].toFixed(1)} ${control[1].toFixed(1)} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`,
        leaflets,
        // Lower, outer fronds appear first and the canopy fills in upwards,
        // the tree opens with a light canopy that fills in as the story goes on
        at: Math.min(0.8, (380 - y) / 260 + random() * 0.25 - 0.35),
      });
    }
  });

  // Drumstick pods hang straight down from the limbs
  const pods = [[150, 300], [182, 330], [214, 358], [330, 238], [352, 262], [420, 340], [448, 320], [476, 318]].map(([x, y]) => {
    const length = 70 + random() * 55;
    const sway = (random() - 0.5) * 14;
    return { d: `M${x} ${y} C${x + sway} ${y + length * 0.4} ${x - sway * 0.5} ${y + length * 0.75} ${x + sway * 0.3} ${y + length}`, at: 0.6 + random() * 0.3 };
  });

  // Small cream flower clusters near branch tips
  const flowers = [[120, 268], [205, 262], [340, 180], [392, 232], [498, 302], [442, 294]].map(([x, y]) => ({
    x,
    y,
    dots: Array.from({ length: 6 }, () => [x + (random() - 0.5) * 16, y + (random() - 0.5) * 12, 2.2 + random() * 1.6]),
  }));

  return { fronds, pods, flowers };
}

const TREE = buildTree();

// `lite` draws every other leaflet: half the work on phones, still reads as a full crown
function MoringaTree({ className = '', lite = false }) {
  const tree = TREE;

  return (
    <svg className={className} viewBox="40 150 520 660" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mt-bark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4d6a6c" />
          <stop offset="0.45" stopColor="#80999a" />
          <stop offset="1" stopColor="#3f5a5d" />
        </linearGradient>
        <radialGradient id="mt-ground" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2c6975" stopOpacity="0.25" />
          <stop offset="1" stopColor="#2c6975" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="300" cy="802" rx="140" ry="16" fill="url(#mt-ground)" />

      {/* Wood */}
      {WOOD.map(([d, width]) => (
        <path key={d} d={d} stroke="url(#mt-bark)" strokeWidth={width} strokeLinecap="round" fill="none" />
      ))}

      {/* Drooping leaf fronds */}
      {tree.fronds.map(({ key, rachis, leaflets, at }) => (
        <g key={key} className="mt-reveal" style={{ '--at': at }}>
          <path d={rachis} stroke="#4f8f80" strokeWidth="1.2" fill="none" opacity="0.8" />
          {(lite ? leaflets.filter((_, index) => index % 2 === 0) : leaflets).map((leaf, index) => (
            <ellipse
              key={index}
              cx={leaf.cx.toFixed(1)}
              cy={leaf.cy.toFixed(1)}
              rx={leaf.rx.toFixed(1)}
              ry={leaf.ry.toFixed(1)}
              fill={leaf.fill}
              opacity={leaf.opacity.toFixed(2)}
              transform={`rotate(${leaf.rotate.toFixed(0)} ${leaf.cx.toFixed(1)} ${leaf.cy.toFixed(1)})`}
            />
          ))}
        </g>
      ))}

      {/* Drumstick pods */}
      {tree.pods.map(({ d, at }) => (
        <path key={d} d={d} className="mt-reveal" style={{ '--at': at }} stroke="#3f7c78" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      ))}

      {/* Flower clusters */}
      {tree.flowers.map(({ x, y, dots }) => (
        <g key={`${x}-${y}`} className="mt-reveal" style={{ '--at': 0.45 }}>
          {dots.map(([dx, dy, r], index) => (
            <circle key={index} cx={dx.toFixed(1)} cy={dy.toFixed(1)} r={r.toFixed(1)} fill="#ffffff" stroke="#cde0c9" strokeWidth="0.6" />
          ))}
        </g>
      ))}
    </svg>
  );
}

export default memo(MoringaTree);
