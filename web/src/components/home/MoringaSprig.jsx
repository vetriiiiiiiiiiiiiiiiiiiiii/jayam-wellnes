// Decorative moringa sprig: a curved stem with paired oval leaflets (pinnate leaf),
// drawn procedurally so it stays crisp at any size and follows the text colour.

const STEM = [
  [100, 312],
  [72, 230],
  [138, 120],
  [112, 18],
];

const cubic = (t, a, b, c, d) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

const cubicSlope = (t, a, b, c, d) =>
  3 * (1 - t) ** 2 * (b - a) + 6 * (1 - t) * t * (c - b) + 3 * t ** 2 * (d - c);

const pointAt = (t) => [0, 1].map((axis) => cubic(t, ...STEM.map((p) => p[axis])));
const slopeAt = (t) => [0, 1].map((axis) => cubicSlope(t, ...STEM.map((p) => p[axis])));

function buildLeaflets(pairs) {
  const leaflets = [];
  for (let i = 0; i < pairs; i += 1) {
    const t = 0.16 + (i / (pairs - 1)) * 0.76;
    const [x, y] = pointAt(t);
    const [dx, dy] = slopeAt(t);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const scale = 1 - i * (0.42 / pairs);
    for (const side of [-1, 1]) {
      leaflets.push({
        key: `${i}-${side}`,
        cx: x,
        cy: y,
        rx: 8.5 * scale,
        ry: 19 * scale,
        // Leaflets angle forward along the stem, alternating sides
        rotate: angle + 90 + side * 58,
        offset: 17 * scale,
        side,
        shade: (i + (side > 0 ? 1 : 0)) % 3,
      });
    }
  }
  return leaflets;
}

export default function MoringaSprig({ className = '', pairs = 9 }) {
  const leaflets = buildLeaflets(pairs);
  const [tipX, tipY] = pointAt(1);
  const [tipDx, tipDy] = slopeAt(1);
  const tipAngle = (Math.atan2(tipDy, tipDx) * 180) / Math.PI + 90;

  return (
    <svg className={className} viewBox="0 0 220 330" fill="none" aria-hidden="true" focusable="false">
      <path
        d={`M${STEM[0].join(' ')} C${STEM[1].join(' ')} ${STEM[2].join(' ')} ${STEM[3].join(' ')}`}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      {leaflets.map(({ key, cx, cy, rx, ry, rotate, offset, shade }) => (
        <g key={key} transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
          <ellipse cx="0" cy={-offset} rx={rx} ry={ry} fill="currentColor" opacity={[0.9, 0.7, 0.55][shade]} />
          <path d={`M0 0 L0 ${-offset - ry * 0.7}`} stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
        </g>
      ))}
      <ellipse
        cx="0"
        cy="-14"
        rx="7"
        ry="15"
        fill="currentColor"
        opacity="0.85"
        transform={`translate(${tipX} ${tipY}) rotate(${tipAngle})`}
      />
    </svg>
  );
}
