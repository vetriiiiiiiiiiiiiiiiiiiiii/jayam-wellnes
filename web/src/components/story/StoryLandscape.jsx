// Full-screen landscape for the Our Story journey. `progress` (0 → 1) drives the scene:
// the sky warms from dawn to morning, the sun rises in an arc and the hills drift apart.

const lerp = (a, b, t) => a + (b - a) * t;

function mix(hexA, hexB, t) {
  const a = hexA.match(/\w\w/g).map((h) => parseInt(h, 16));
  const b = hexB.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`;
}

export default function StoryLandscape({ progress, compact = false }) {
  const p = Math.min(Math.max(progress, 0), 1);

  // Sky: dawn peach → soft morning light
  const skyTop = mix('#efe2d0', '#eef1e6', p);
  const skyMid = mix('#f5d9b4', '#f6efdc', p);
  const skyLow = mix('#f2c391', '#f7e6c2', p);

  // Sun rises from behind the hills and travels up and slightly right
  // On narrow screens the scene is cropped to its centre, so keep the sun small and central
  const sunX = compact ? lerp(780, 840, p) : lerp(700, 980, p);
  const sunY = lerp(760, compact ? 496 : 250, Math.sin((p * Math.PI) / 2));
  const sunR = lerp(120, 96, p) * (compact ? 0.55 : 1);
  const sunColor = mix('#f3b46a', '#f6d68f', p);

  // Hills drift a little at different speeds for depth
  const far = lerp(0, -30, p);
  const mid = lerp(0, -60, p);
  const near = lerp(0, -100, p);

  return (
    <svg className="sj-landscape" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sj-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="0.6" stopColor={skyMid} />
          <stop offset="1" stopColor={skyLow} />
        </linearGradient>
        <radialGradient id="sj-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fde8b8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fde8b8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sj-h1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6dcc6" />
          <stop offset="1" stopColor="#c8d1b6" />
        </linearGradient>
        <linearGradient id="sj-h2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b5c4a2" />
          <stop offset="1" stopColor="#a3b590" />
        </linearGradient>
        <linearGradient id="sj-h3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fa680" />
          <stop offset="1" stopColor="#7a9269" />
        </linearGradient>
        <linearGradient id="sj-h4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b8460" />
          <stop offset="1" stopColor="#566e4c" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#sj-sky)" />

      <circle cx={sunX} cy={sunY} r={sunR * 2.6} fill="url(#sj-glow)" />
      <circle cx={sunX} cy={sunY} r={sunR} fill={sunColor} />

      {/* Soft clouds */}
      <g fill="#fffaf0" opacity={lerp(0.5, 0.85, p)}>
        <ellipse cx={lerp(260, 330, p)} cy="210" rx="120" ry="16" />
        <ellipse cx={lerp(320, 390, p)} cy="196" rx="70" ry="14" />
        <ellipse cx={lerp(1260, 1180, p)} cy="160" rx="100" ry="13" />
        <ellipse cx={lerp(1320, 1240, p)} cy="148" rx="50" ry="10" />
      </g>

      <g transform={`translate(0 ${far})`}>
        <path d="M0 560 C220 500 420 520 640 556 C860 592 1060 520 1280 530 C1420 536 1520 556 1600 548 L1600 960 L0 960 Z" fill="url(#sj-h1)" />
      </g>
      <g transform={`translate(0 ${mid})`}>
        <path d="M0 640 C200 590 400 610 600 646 C820 684 1040 604 1260 616 C1420 626 1520 650 1600 640 L1600 1000 L0 1000 Z" fill="url(#sj-h2)" />
      </g>
      <g transform={`translate(0 ${near})`}>
        <path d="M0 730 C240 680 470 712 700 742 C930 772 1130 700 1360 712 C1480 718 1560 734 1600 730 L1600 1060 L0 1060 Z" fill="url(#sj-h3)" />
        {/* A path winding towards the horizon */}
        <path d="M820 1060 C800 980 880 930 850 870 C826 822 770 800 790 760" stroke="#ece2c9" strokeWidth="26" strokeLinecap="round" fill="none" opacity="0.5" />
      </g>
      <path d="M0 830 C260 790 520 820 760 846 C1000 872 1240 812 1600 826 L1600 900 L0 900 Z" fill="url(#sj-h4)" />
    </svg>
  );
}
