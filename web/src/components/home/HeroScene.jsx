// Morning landscape for the hero arch: soft sky, the Jayam emblem rising as the sun, and layered sage hills.
// Drawn as SVG so it is crisp at any size and needs no image files.

export default function HeroScene() {
  return (
    <svg className="wl-scene" viewBox="0 0 400 490" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3ecdc" />
          <stop offset="0.55" stopColor="#f8e6c4" />
          <stop offset="1" stopColor="#f3dcb4" />
        </linearGradient>
        <radialGradient id="wl-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fbe5ad" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fbe5ad" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wl-hill-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfd8bf" />
          <stop offset="1" stopColor="#c2cdb1" />
        </linearGradient>
        <linearGradient id="wl-hill-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9ba97" />
          <stop offset="1" stopColor="#97aa85" />
        </linearGradient>
        <linearGradient id="wl-hill-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d9470" />
          <stop offset="1" stopColor="#647b59" />
        </linearGradient>
      </defs>

      <rect width="400" height="490" fill="url(#wl-sky)" />

      {/* The Jayam emblem is the rising sun: it lifts from behind the hills on load */}
      <g className="wl-scene-sun">
        <circle cx="200" cy="180" r="150" fill="url(#wl-glow)" />
        <circle cx="200" cy="180" r="86" fill="#fcf6e8" />
        <circle cx="200" cy="180" r="86" fill="none" stroke="#efd9a6" strokeWidth="1.5" />
        <image href="/jayam-logo.png" x="128" y="108" width="144" height="144" preserveAspectRatio="xMidYMid meet" />
      </g>

      {/* Soft clouds */}
      <g className="wl-scene-clouds" fill="#fffaf0" opacity="0.75">
        <ellipse cx="88" cy="150" rx="46" ry="9" />
        <ellipse cx="112" cy="142" rx="26" ry="8" />
        <ellipse cx="318" cy="118" rx="38" ry="7" />
      </g>

      {/* Layered hills */}
      <path d="M0 300 C70 262 130 270 200 292 C268 312 330 268 400 278 L400 490 L0 490 Z" fill="url(#wl-hill-far)" />
      <path d="M0 352 C80 318 150 330 222 352 C292 374 346 336 400 340 L400 490 L0 490 Z" fill="url(#wl-hill-mid)" />
      <path d="M0 408 C96 370 182 392 252 410 C318 428 362 402 400 396 L400 490 L0 490 Z" fill="url(#wl-hill-near)" />

      {/* A gentle path winding into the hills */}
      <path d="M214 490 C206 460 236 446 226 424 C218 406 196 398 204 380" stroke="#e9dfc7" strokeWidth="9" strokeLinecap="round" fill="none" opacity="0.55" />
    </svg>
  );
}
